import { ai } from "../../infra/ai";
import { sendPushNotificationToUser } from "../../infra/fcm";
import { ConflictError, NotFoundError } from "../../lib/error";
import { ConsensusRepository } from "../consensus/repository";
import { NotificationRepository } from "../notification/repository";
import { CareRecordRepository } from "./care-record.repository";
import { CatStatRepository } from "./cat-stat.repository";
import { getEmotion } from "./constants/emotion";
import { getAgeGroup } from "./constants/growth";
import { buildCarePrompt } from "./prompts/care";
import { CatRepository } from "./repository";

export abstract class CatCareService {
  private static catRepository = CatRepository;
  private static catStatRepository = CatStatRepository;
  private static careRecordRepository = CareRecordRepository;
  private static consensusRepository = ConsensusRepository;
  private static notificationRepository = NotificationRepository;

  static async careForCat({ userId }: { userId: string }) {
    // 1) 고양이 + 스탯 + 성격 + consensus 값 병렬 조회
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
      CatCareService.catRepository.findFullByServantId({ servantId: userId }),
      Promise.all([
        CatCareService.consensusRepository.getValue(
          "CAT.COOLDOWN_HOUR_BETWEEN_CARE",
        ),
        CatCareService.consensusRepository.getValue("CAT.GROWTH_PER_CARE"),
        CatCareService.consensusRepository.getValue("CAT.EMOTION_PER_CARE"),
        CatCareService.consensusRepository.getValue("CAT.EMOTION_DECREASE"),
        CatCareService.consensusRepository.getValue(
          "CAT.EMOTION_DECREASE_FREQUENCY_HOUR",
        ),
      ]),
    ]);

    if (!catFull) {
      throw new NotFoundError("You don't have a cat to care for.");
    }

    const { cat, stat: catStat, personality } = catFull;

    // 2) 쿨다운 체크 + 마지막 돌봄 시간 업데이트 (atomic conditional UPDATE)
    const updated = await CatCareService.catRepository.tryUpdateLastCaredAt({
      catId: cat.id,
      cooldownHours: cooldownHour,
    });

    if (updated.length === 0) {
      throw new ConflictError("Care is on cooldown.");
    }

    // 3) 누적 감정 감소 계산 (lastCaredAt 기준 경과 주기 수)
    const neglectCycles = cat.lastCaredAt
      ? Math.floor(
          (Date.now() - new Date(cat.lastCaredAt).getTime()) /
            (emotionDecreaseFrequencyHour * 60 * 60 * 1000),
        )
      : 0;
    const decayAmount = neglectCycles * emotionDecrease;

    // 4) 스탯 업데이트 (감소 적용 후 케어 보너스)
    const newGrowth = catStat.growth + growthPerCare;
    const newEmotion = Math.min(
      Math.max(0, catStat.emotion - decayAmount) + emotionPerCare,
      100,
    );
    const [updatedCatStat] =
      await CatCareService.catStatRepository.updateAfterCare({
        catId: cat.id,
        growth: newGrowth,
        emotion: newEmotion,
      });

    // 5) AI 메시지 생성
    const emotionState = getEmotion(newEmotion);
    const ageGroup = getAgeGroup(newGrowth);

    const carePrompt = buildCarePrompt({
      catName: cat.name,
      mood: emotionState.level,
      ageGroup,
      personality,
    });

    let message = "";

    try {
      const { text } = await ai.ask(
        "anthropic/claude-haiku-4-5",
        // "google/gemini-2.5-flash-lite",
        // "xai/grok-4-fast-non-reasoning",
        // "openai/gpt-4.1-nano",
        // "mistral/ministral-3b-latest",
        // "alibaba/qwen3.5-plus",
        {
          // maxOutputTokens: 40,
          ...carePrompt,
        },
      );

      message = text.trim();
    } catch (error) {
      console.error("Error generating care message:", error);
      message = `${cat.name} enjoyed the care and purrs contentedly.`;
    }

    // 6) 돌봄 기록 생성 + 푸시 알림 발송 (병렬)
    const fcmTokens =
      await CatCareService.notificationRepository.findTokensByUserId({
        userId,
      });
    await Promise.all([
      CatCareService.careRecordRepository.create({
        catId: cat.id,
        emotionDelta: emotionPerCare,
        growthDelta: growthPerCare,
        servantId: userId,
        message,
      }),
      sendPushNotificationToUser({
        tokens: fcmTokens.map((t) => t.token),
        title: cat.name,
        body: message,
      }),
    ]);

    return {
      growth: {
        age: getAgeGroup(updatedCatStat.growth),
        value: updatedCatStat.growth,
      },
      emotion: {
        value: updatedCatStat.emotion,
        emoji: emotionState.emoji,
        level: emotionState.level,
      },
      message,
    };
  }
}
