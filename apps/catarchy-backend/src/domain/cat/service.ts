import { getDatabase } from "../../infra/db";
import { runAtomic } from "../../lib/atomic";
import { ConflictError, NotFoundError } from "../../lib/error";
import { CatStatRepository } from "./cat-stat.repository";
import { getEmotion } from "./constants/emotion";
import { getAgeGroup } from "./constants/growth";
import { CatRepository } from "./repository";

export abstract class CatService {
  private static catRepository = CatRepository;
  private static catStatRepository = CatStatRepository;

  static async getCatInfo({ userId }: { userId: string }) {
    const cat = await this.catRepository.findWithStatByServantId({
      servantId: userId,
    });

    if (!cat) {
      throw new NotFoundError("Cat not found for the user.");
    }

    const emotionState = getEmotion(cat.stat.emotion);

    return {
      id: cat.cat.id,
      name: cat.cat.name,
      stat: {
        growth: {
          age: getAgeGroup(cat.stat.growth),
          value: cat.stat.growth,
        },
        emotion: {
          value: cat.stat.emotion,
          emoji: emotionState.emoji,
          level: emotionState.level,
        },
      },
      lastCaredAt: cat.cat.lastCaredAt,
    };
  }

  static async summonCat({
    userId,
    name,
    sex,
  }: {
    userId: string;
    name: string;
    sex: string;
  }) {
    const existingCat = await this.catRepository.findByServantId({
      servantId: userId,
    });

    if (existingCat) {
      throw new ConflictError("You already have a cat.");
    }

    const newCatId = crypto.randomUUID();

    const [[newCat]] = await runAtomic(getDatabase(), [
      this.catRepository.create({ id: newCatId, servantId: userId, name, sex }),
      this.catStatRepository.create({ catId: newCatId, growth: 0, emotion: 100 }),
    ]);

    return {
      id: newCat.id,
      name: newCat.name,
      servantId: newCat.servantId,
    };
  }
}
