import { CatRepository, getAge } from "@/domain/cat";

import { ChronicleService } from "./service";

export abstract class ChronicleHandler {
  private static catRepository = CatRepository;

  static async recordAgeChangeEvent({ catId }: { catId: string }) {
    if (!catId) return;

    const cat = await this.catRepository.findWithStatByCatId({ catId });
    const age = getAge(cat.growth);
    const isAgeUp = age.int > 0 && age.fraction.numerator === 0;
    const isOneYearOld = isAgeUp && age.int === 1;
    const isTenTimesOlder = isAgeUp && age.int % 10 === 0;

    if (isOneYearOld || isTenTimesOlder) {
      await ChronicleService.recordAgeChangeEvent({
        catId,
        catName: cat.name,
        age: age.int,
      });
    }
  }

  static async recordFriendshipEvent({
    catId,
    targetCatId,
  }: {
    catId: string;
    targetCatId: string;
  }) {
    const [cat, targetCat] = await Promise.all([
      this.catRepository.findWithStatByCatId({ catId }),
      this.catRepository.findWithStatByCatId({ catId: targetCatId }),
    ]);

    return ChronicleService.recordFriendshipEvent({
      catId,
      catName: cat.name,
      targetCatId,
      targetCatName: targetCat.name,
    });
  }

  static async recordLoveEvent({
    catId,
    targetCatId,
  }: {
    catId: string;
    targetCatId: string;
  }) {
    const [cat, targetCat] = await Promise.all([
      this.catRepository.findWithStatByCatId({ catId }),
      this.catRepository.findWithStatByCatId({ catId: targetCatId }),
    ]);

    return ChronicleService.recordLoveEvent({
      catId,
      catName: cat.name,
      targetCatId,
      targetCatName: targetCat.name,
    });
  }
}
