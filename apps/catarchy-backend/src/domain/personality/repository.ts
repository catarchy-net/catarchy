import { and, count, eq, isNull, sql } from "drizzle-orm";
import { getDatabase, table } from "../../infra/db";

export abstract class PersonalityRepository {
  private static get db() {
    return getDatabase();
  }

  static async getQuestionCount() {
    const [result] = await this.db
      .select({ count: count() })
      .from(table.personalityQuestion);

    return result.count;
  }

  static async getRemainingQuestionCount({ catId }: { catId: string }) {
    const [result] = await this.db
      .select({
        count: count(table.personalityQuestion.id),
      })
      .from(table.personalityQuestion)
      .leftJoin(
        table.personalityTestAnswer,
        and(
          eq(
            table.personalityTestAnswer.questionId,
            table.personalityQuestion.id,
          ),
          eq(table.personalityTestAnswer.catId, catId),
        ),
      )
      .where(isNull(table.personalityTestAnswer.catId));

    return result.count;
  }

  static async getOneRandomQuestion({ catId }: { catId: string }) {
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
      .leftJoin(
        table.personalityTestAnswer,
        and(
          eq(
            table.personalityTestAnswer.questionId,
            table.personalityQuestion.id,
          ),
          eq(table.personalityTestAnswer.catId, catId),
        ),
      )
      .where(isNull(table.personalityTestAnswer.catId))
      .orderBy(sql`RANDOM()`)
      .limit(1);

    // descriptionLevelN -> arraify
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
      ],
    };
  }

  static async saveAnswer({
    catId,
    questionId,
    answer,
  }: {
    catId: string;
    questionId: string;
    answer: number;
  }) {
    return await this.db.insert(table.personalityTestAnswer).values({
      catId,
      questionId,
      answer,
    });
  }

  static async createCatPersonality({
    catId,
    agreeableness,
    conscientiousness,
    extraversion,
    neuroticism,
    openness,
  }: {
    catId: string;
    agreeableness: number;
    conscientiousness: number;
    extraversion: number;
    neuroticism: number;
    openness: number;
  }) {
    const [data] = await this.db
      .insert(table.catPersonality)
      .values({
        catId,
        agreeableness,
        conscientiousness,
        extraversion,
        neuroticism,
        openness,
      })
      .returning({
        catId: table.catPersonality.catId,
      });

    return data;
  }

  static async updateCatPersonality({
    catId,
    agreeableness,
    conscientiousness,
    extraversion,
    neuroticism,
    openness,
  }: {
    catId: string;
    agreeableness: number;
    conscientiousness: number;
    extraversion: number;
    neuroticism: number;
    openness: number;
  }) {
    const [data] = await this.db
      .update(table.catPersonality)
      .set({
        agreeableness,
        conscientiousness,
        extraversion,
        neuroticism,
        openness,
      })
      .where(eq(table.catPersonality.catId, catId))
      .returning({
        catId: table.catPersonality.catId,
      });

    return data;
  }

  static async getAllResult({ catId }: { catId: string }) {
    const results = await this.db
      .select({
        questionId: table.personalityTestAnswer.questionId,
        keyed: table.personalityQuestion.keyed,
        domain: table.personalityQuestion.domain,
        answer: table.personalityTestAnswer.answer,
      })
      .from(table.personalityTestAnswer)
      .innerJoin(
        table.personalityQuestion,
        eq(
          table.personalityQuestion.id,
          table.personalityTestAnswer.questionId,
        ),
      )
      .where(eq(table.personalityTestAnswer.catId, catId));

    return results;
  }
}
