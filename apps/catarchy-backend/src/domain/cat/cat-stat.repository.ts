import { eq, sql } from "drizzle-orm";
import { getDatabase, table } from "../../infra/db";

export abstract class CatStatRepository {
  private static get db() {
    return getDatabase();
  }

  static create({
    catId,
    growth,
    emotion,
  }: {
    catId: string;
    growth: number;
    emotion: number;
  }) {
    return this.db.insert(table.catStat).values({ catId, growth, emotion });
  }

  static updateAfterCare({
    catId,
    growth,
    emotion,
  }: {
    catId: string;
    growth: number;
    emotion: number;
  }) {
    return this.db
      .update(table.catStat)
      .set({ growth, emotion })
      .where(eq(table.catStat.catId, catId))
      .returning();
  }

  /** 마지막 케어가 frequencyHours 이상 지난 고양이의 감정을 amount만큼 감소 (최소 0) */
  static decayEmotionForNeglectedCats({
    amount,
    frequencyHours,
  }: {
    amount: number;
    frequencyHours: number;
  }) {
    return this.db
      .update(table.catStat)
      .set({
        emotion: sql`MAX(0, ${table.catStat.emotion} - ${amount})`,
      })
      .where(
        sql`${table.catStat.catId} IN (
          SELECT id FROM cat
          WHERE last_cared_at IS NULL
             OR datetime(last_cared_at) < datetime('now', ${`-${frequencyHours} hours`})
        )`,
      )
      .returning({
        catId: table.catStat.catId,
        emotion: table.catStat.emotion,
      });
  }
}
