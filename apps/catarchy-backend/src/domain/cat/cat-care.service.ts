import { ai } from "../../infra/ai";
import { sendPushNotification } from "../../infra/fcm";
import { ConflictError, NotFoundError } from "../../lib/error";
import { logger } from "../../lib/logger";
import { CursorQuery } from "../../lib/pagination";
import { ConsensusRepository } from "../consensus/repository";
import { NotificationRepository } from "../notification/repository";
import { CareRecordRepository } from "./care-record.repository";
import { CatStatRepository } from "./cat-stat.repository";
import { calculateNewEmotion, getEmotion } from "./lib/emotion";
import { getAge, getAgeGroup } from "./lib/growth";
import { CatRepository } from "./repository";

export abstract class CatCareService {
  private static catRepository = CatRepository;
  private static catStatRepository = CatStatRepository;
  private static careRecordRepository = CareRecordRepository;
  private static consensusRepository = ConsensusRepository;
  private static notificationRepository = NotificationRepository;

  static async careForCat({
    userId,
    catId,
  }: {
    userId: string;
    catId: string;
  }) {
    // 1) get cat, cat stat, and consensus values needed for care logic in parallel
    const [
      catFull,
      [
        cooldownHour,
        growthPerCare,
        emotionPerCare,
        emotionDecrease,
        emotionDecreaseFrequencyHour,
      ],
    ] = await Promise.all([
      this.catRepository.findFullById({ catId, servantId: userId }),
      Promise.all([
        this.consensusRepository.findValue("CAT.COOLDOWN_HOUR_BETWEEN_CARE"),
        this.consensusRepository.findValue("CAT.GROWTH_PER_CARE"),
        this.consensusRepository.findValue("CAT.EMOTION_PER_CARE"),
        this.consensusRepository.findValue("CAT.EMOTION_DECREASE"),
        this.consensusRepository.findValue(
          "CAT.EMOTION_DECREASE_FREQUENCY_HOUR",
        ),
      ]),
    ]);

    if (!catFull) {
      throw new NotFoundError("You don't have a cat to care for.");
    }

    const { cat, stat: catStat } = catFull;

    // 2) check care cooldown and atomically update last cared time. If still on cooldown, throw error
    const lastCaredAt = new Date().toISOString();

    const updated = await this.catRepository.tryUpdateLastCaredAt({
      catId: cat.id,
      cooldownHours: cooldownHour,
      lastCaredAt,
    });

    if (updated.length === 0) {
      throw new ConflictError("Care is on cooldown.");
    }

    // 3+4) calculate new stat with decay and care increment
    const oldEmotion = catStat.emotion;
    const oldGrowth = catStat.growth;

    const newGrowth = oldGrowth + growthPerCare;
    const newEmotion = calculateNewEmotion({
      currentEmotion: oldEmotion,
      lastCaredAt: cat.lastCaredAt,
      emotionPerCare,
      emotionDecrease,
      emotionDecreaseFrequencyHour,
    });

    await this.catStatRepository.updateAfterCare({
      catId: cat.id,
      growth: newGrowth,
      emotion: newEmotion,
    });

    const [careRecord] = await this.careRecordRepository.create({
      catId: cat.id,
      emotion: newEmotion,
      emotionDelta: newEmotion - oldEmotion,
      growth: newGrowth,
      growthDelta: newGrowth - oldGrowth,
      servantId: userId,
    });

    return {
      catId: cat.id,
      growth: {
        ageGroup: getAgeGroup(newGrowth),
        age: getAge(newGrowth),
        value: newGrowth,
      },
      emotion: {
        value: newEmotion,
        emoji: getEmotion(newEmotion).emoji,
        level: getEmotion(newEmotion).level,
      },
      careRecord,
    };
  }

  static async getCareRecords({
    userId,
    catId,
    ...pagination
  }: { userId: string; catId: string } & CursorQuery) {
    const limit = pagination.limit;
    const cursor = pagination.cursor;

    const { hasMore, items, nextCursor } =
      await this.careRecordRepository.findByCursor({
        userId,
        catId,
        cursor,
        limit,
      });

    const populatedItems = items.map((record) => ({
      ...record,
      growth: {
        value: record.growth,
        age: getAge(record.growth),
        ageGroup: getAgeGroup(record.growth),
        delta: record.growthDelta,
      },
      emotion: {
        value: record.emotion,
        emoji: getEmotion(record.emotion).emoji,
        level: getEmotion(record.emotion).level,
        delta: record.emotionDelta,
      },
    }));

    return {
      items: populatedItems,
      nextCursor,
      hasMore,
    };
  }

  static async getCareRecord({
    userId,
    careRecordId,
  }: {
    userId: string;
    careRecordId: string;
  }) {
    const record = await this.careRecordRepository.findById({
      id: careRecordId,
      userId,
    });

    if (!record) {
      throw new NotFoundError("Care record not found.");
    }

    return {
      ...record,
      growth: {
        value: record.growth,
        age: getAge(record.growth),
        ageGroup: getAgeGroup(record.growth),
        delta: record.growthDelta,
      },
      emotion: {
        value: record.emotion,
        emoji: getEmotion(record.emotion).emoji,
        level: getEmotion(record.emotion).level,
        delta: record.emotionDelta,
      },
    };
  }

  static async saveCareMessage({
    catRecordId,
    catId,
  }: {
    catRecordId: string;
    catId: string;
  }) {
    const [cat, catStat] = await Promise.all([
      this.catRepository.findById({ catId }),
      this.catStatRepository.findByCatId({ catId }),
    ]);

    if (!cat || !catStat) return;

    const hour = new Date().getUTCHours();
    const timePeriod =
      hour >= 5 && hour < 12 ? "morning"
      : hour >= 12 && hour < 18 ? "afternoon"
      : hour >= 18 && hour < 22 ? "evening"
      : "night";

    let message = "";
    try {
      const { text } = await ai.ask(
        // "anthropic/claude-haiku-4-5",
        // "xai/grok-4-fast-non-reasoning",
        // "xai/grok-4.3",
        "openai/gpt-4.1-nano",
        {
        maxOutputTokens: 50,
        temperature: 0.8,
        system: `Describe a cat's behavior/Lang: en-US/Pattern: "[Name(no-capitalize)] verb object [adverb/adjective phrase]."/1~2 sentences/Plain text only/Reflect time of day in behavior`,
        prompt: `${cat.name}, mood:${getEmotion(catStat.emotion).level}, age:${getAgeGroup(catStat.growth)}, time:${timePeriod}`,
      });
      message = text.trim();
    } catch {
      message = `${cat.name} enjoyed the care and purrs contentedly.`;
    }

    await this.careRecordRepository.updateCareMessage({
      id: catRecordId,
      message,
    });
  }

  /**
   * *Only for cron job
   */
  static async remindCare() {
    const frequencyHours = await this.consensusRepository.findValue(
      "CAT.EMOTION_DECREASE_FREQUENCY_HOUR",
    );

    const threshold = new Date(
      Date.now() - frequencyHours * 60 * 60 * 1000,
    ).toISOString();

    const cats = await this.catRepository.findAllCareOverdueWithFCM({
      threshold,
    });

    const failedList: string[] = [];

    await Promise.all(
      cats.map(async (cat) => {
        const { success } = await sendPushNotification({
          token: cat.fcmToken,
          title: "Your cat needs care!",
          body: `Your cat ${cat.name} hasn't been cared for in a while. Please take care of your cat!`,
          url: "/play",
        });

        if (!success) {
          failedList.push(cat.fcmToken);
        }
      }),
    );

    logger.info(
      `Sent care reminder to ${cats.length} cats, ${failedList.length} failed.`,
    );

    if (failedList.length > 0) {
      await this.notificationRepository.deleteFcmTokens({
        tokens: failedList,
      });
    }
  }
}
