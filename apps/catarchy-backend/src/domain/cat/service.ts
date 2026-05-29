import { uuidv7 } from "uuidv7";

import { getDatabase } from "../../infra/db";
import { CatSex } from "../../infra/db/schema";
import { runAtomic } from "../../lib/atomic";
import { ConflictError, NotFoundError } from "../../lib/error";
import { CatStatRepository } from "./cat-stat.repository";
import { getEmotion } from "./lib/emotion";
import { getAge, getAgeGroup } from "./lib/growth";
import { CatRepository } from "./repository";

export abstract class CatService {
  private static catRepository = CatRepository;
  private static catStatRepository = CatStatRepository;

  private static get db() {
    return getDatabase();
  }

  static async getCatList({ userId }: { userId: string }) {
    const cats = await this.catRepository.findAllByServantId({
      servantId: userId,
    });

    return cats.map((cat) => ({
      id: cat.id,
      name: cat.name,
      sex: cat.sex as CatSex | null,
    }));
  }

  static async getCatInfo({
    userId,
    catId,
  }: {
    userId: string;
    catId: string;
  }) {
    const cat = await this.catRepository.findWithStatById({
      catId,
      servantId: userId,
    });

    if (!cat) {
      throw new NotFoundError("Cat not found for the user.");
    }

    const emotionState = getEmotion(cat.stat.emotion);

    return {
      id: cat.cat.id,
      name: cat.cat.name,
      sex: cat.cat.sex as CatSex | null,
      stat: {
        growth: {
          ageGroup: getAgeGroup(cat.stat.growth),
          value: cat.stat.growth,
          age: getAge(cat.stat.growth),
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
    sex: CatSex;
  }) {
    const existingCat = await this.catRepository.findByServantId({
      servantId: userId,
    });

    if (existingCat) {
      throw new ConflictError("You already have a cat.");
    }

    const newCatId = uuidv7();

    const [[newCat]] = await runAtomic(this.db, [
      this.catRepository.create({ id: newCatId, servantId: userId, name, sex }),
      this.catStatRepository.create({
        catId: newCatId,
        growth: 0,
        emotion: 100,
      }),
    ]);

    return {
      id: newCat.id,
      name: newCat.name,
      servantId: newCat.servantId,
    };
  }
}
