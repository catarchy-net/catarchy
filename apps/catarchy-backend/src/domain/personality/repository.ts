import { and, count, eq } from "drizzle-orm";
import { getDatabase, table } from "../../infra/db";

export abstract class PersonalityRepository {
  private static get db() {
    return getDatabase();
  }

  static async getCatPersonality({ catId }: { catId: string }) {
    const [result] = await this.db
      .select({
        openness: table.catPersonality.openness,
        conscientiousness: table.catPersonality.conscientiousness,
        extraversion: table.catPersonality.extraversion,
        agreeableness: table.catPersonality.agreeableness,
        neuroticism: table.catPersonality.neuroticism,
      })
      .from(table.catPersonality)
      .where(
        and(
          eq(table.catPersonality.catId, catId),
          eq(table.catPersonality.remainingCount, 0),
        ),
      )
      .limit(1);

    return result;
  }

  static async getCatPersonalityProgress({ catId }: { catId: string }) {
    const [result] = await this.db
      .select({
        openness: table.catPersonality.openness,
        conscientiousness: table.catPersonality.conscientiousness,
        extraversion: table.catPersonality.extraversion,
        agreeableness: table.catPersonality.agreeableness,
        neuroticism: table.catPersonality.neuroticism,
        remainingCount: table.catPersonality.remainingCount,
      })
      .from(table.catPersonality)
      .where(eq(table.catPersonality.catId, catId))
      .limit(1);

    return result ?? null;
  }

  static async getQuestionCount() {
    const [result] = await this.db
      .select({ count: count() })
      .from(table.personalityQuestion);

    return result.count;
  }

  static async getRemainingQuestionCount({ catId }: { catId: string }) {
    const progress = await this.getCatPersonalityProgress({ catId });
    if (!progress) {
      return await this.getQuestionCount();
    }
    return progress.remainingCount;
  }

  static async getNextQuestion({ catId }: { catId: string }) {
    const [totalCount, progress] = await Promise.all([
      this.getQuestionCount(),
      this.getCatPersonalityProgress({ catId }),
    ]);

    if (progress?.remainingCount === 0) return null;

    const answeredCount = progress ? totalCount - progress.remainingCount : 0;

    const [result] = await this.db
      .select({
        id: table.personalityQuestion.id,
        text: table.personalityQuestion.text,
        keyed: table.personalityQuestion.keyed,
        domain: table.personalityQuestion.domain,
        descriptionLevel1: table.personalityQuestion.descriptionLevel1,
        descriptionLevel2: table.personalityQuestion.descriptionLevel2,
        descriptionLevel3: table.personalityQuestion.descriptionLevel3,
        descriptionLevel4: table.personalityQuestion.descriptionLevel4,
        descriptionLevel5: table.personalityQuestion.descriptionLevel5,
      })
      .from(table.personalityQuestion)
      .orderBy(table.personalityQuestion.id)
      .limit(1)
      .offset(answeredCount);

    if (!result) return null;

    return {
      id: result.id,
      text: result.text,
      keyed: result.keyed,
      domain: result.domain,
      descriptions: [
        result.descriptionLevel1,
        result.descriptionLevel2,
        result.descriptionLevel3,
        result.descriptionLevel4,
        result.descriptionLevel5,
      ] as [string, string, string, string, string],
    };
  }

  static async getQuestion({ questionId }: { questionId: string }) {
    const [result] = await this.db
      .select({
        id: table.personalityQuestion.id,
        keyed: table.personalityQuestion.keyed,
        domain: table.personalityQuestion.domain,
      })
      .from(table.personalityQuestion)
      .where(eq(table.personalityQuestion.id, questionId))
      .limit(1);

    return result ?? null;
  }

  static async initCatPersonality({
    catId,
    totalCount,
  }: {
    catId: string;
    totalCount: number;
  }) {
    await this.db
      .insert(table.catPersonality)
      .values({
        catId,
        openness: 0,
        conscientiousness: 0,
        extraversion: 0,
        agreeableness: 0,
        neuroticism: 0,
        remainingCount: totalCount,
      })
      .onConflictDoNothing();
  }

  static async updateCatPersonality({
    catId,
    openness,
    conscientiousness,
    extraversion,
    agreeableness,
    neuroticism,
    remainingCount,
  }: {
    catId: string;
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
    remainingCount: number;
  }) {
    await this.db
      .update(table.catPersonality)
      .set({
        openness,
        conscientiousness,
        extraversion,
        agreeableness,
        neuroticism,
        remainingCount,
      })
      .where(eq(table.catPersonality.catId, catId));
  }
}
