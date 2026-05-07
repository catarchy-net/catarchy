import { ConflictError, NotFoundError } from "../../lib/error";
import { CatStatRepository } from "./cat-stat.repository";
import { getEmotion } from "./constants/emotion";
import { getAgeGroup } from "./constants/growth";
import { CatRepository } from "./repository";

export abstract class CatService {
  private static catRepository = CatRepository;
  private static catStatRepository = CatStatRepository;

  static async getCatInfo({ userId }: { userId: string }) {
    const cat = await CatService.catRepository.findWithStatByServantId({
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

  static async summonCat({ userId, name }: { userId: string; name: string }) {
    const existingCat = await CatService.catRepository.findByServantId({
      servantId: userId,
    });

    if (existingCat) {
      throw new ConflictError("You already have a cat.");
    }

    // 고양이 생성
    const newCatId = crypto.randomUUID();

    // D1 batch does not support RETURNING, so run separately
    const [newCat] = await CatService.catRepository.create({
      id: newCatId,
      servantId: userId,
      name,
    });
    await CatService.catStatRepository.create({
      catId: newCatId,
      growth: 0,
      emotion: 100,
    });

    return {
      id: newCat.id,
      name: newCat.name,
      servantId: newCat.servantId,
    };
  }
}
