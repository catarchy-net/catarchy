import { and, eq, isNull, lt, or, sql } from "drizzle-orm";

import { getDatabase, table } from "@/infra/db";
import { CatSex } from "@/infra/db/schema";

export abstract class CatRepository {
  private static get db() {
    return getDatabase();
  }

  static async findById({ catId }: { catId: string }) {
    const [cat] = await this.db
      .select()
      .from(table.cat)
      .where(eq(table.cat.id, catId))
      .limit(1);
    return cat;
  }

  static async findByServantId({
    servantId,
    catId,
  }: {
    servantId: string;
    catId?: string;
  }) {
    const [cat] = await this.db
      .select()
      .from(table.cat)
      .where(
        and(
          eq(table.cat.servantId, servantId),
          catId ? eq(table.cat.id, catId) : undefined,
        ),
      )
      .limit(1);

    return cat;
  }

  static async findAllByServantId({ servantId }: { servantId: string }) {
    return this.db
      .select()
      .from(table.cat)
      .where(eq(table.cat.servantId, servantId));
  }

  static async findWithStatById({
    catId,
    servantId,
  }: {
    catId: string;
    servantId: string;
  }) {
    const [result] = await this.db
      .select({ cat: table.cat, stat: table.catStat })
      .from(table.cat)
      .innerJoin(table.catStat, eq(table.cat.id, table.catStat.catId))
      .where(and(eq(table.cat.id, catId), eq(table.cat.servantId, servantId)))
      .limit(1);

    return result;
  }

  // For internal use only - does not check servantId
  static async findWithStatByCatId({ catId }: { catId: string }) {
    const [result] = await this.db
      .select({
        id: table.cat.id,
        name: table.cat.name,
        sex: table.cat.sex,
        growth: table.catStat.growth,
        emotion: table.catStat.emotion,
      })
      .from(table.cat)
      .innerJoin(table.catStat, eq(table.cat.id, table.catStat.catId))
      .where(eq(table.cat.id, catId))
      .limit(1);

    return result;
  }

  static create({
    id,
    servantId,
    name,
    sex,
  }: {
    id: string;
    servantId: string;
    name: string;
    sex: CatSex;
  }) {
    return this.db
      .insert(table.cat)
      .values({ id, servantId, name, sex })
      .returning();
  }

  /** Atomically sets last_cared_at only if cooldown has passed. Returns the updated row, or empty array if still on cooldown. */
  static tryUpdateLastCaredAt({
    catId,
    cooldownHours,
    lastCaredAt,
  }: {
    catId: string;
    cooldownHours: number;
    lastCaredAt?: string | null;
  }) {
    return this.db
      .update(table.cat)
      .set({ lastCaredAt: lastCaredAt || new Date().toISOString() })
      .where(
        and(
          eq(table.cat.id, catId),
          or(
            isNull(table.cat.lastCaredAt),
            sql`datetime(${table.cat.lastCaredAt}) < datetime('now', ${`-${cooldownHours} hours`})`,
          ),
        ),
      )
      .returning({ id: table.cat.id });
  }

  static async findFullById({
    catId,
    servantId,
  }: {
    catId: string;
    servantId: string;
  }) {
    const [result] = await this.db
      .select({
        cat: table.cat,
        stat: table.catStat,
        personality: table.catPersonality,
      })
      .from(table.cat)
      .innerJoin(table.catStat, eq(table.cat.id, table.catStat.catId))
      .leftJoin(
        table.catPersonality,
        eq(table.cat.id, table.catPersonality.catId),
      )
      .where(and(eq(table.cat.id, catId), eq(table.cat.servantId, servantId)))
      .limit(1);

    return result;
  }

  static async findAllCareOverdueWithFCM({ threshold }: { threshold: string }) {
    return this.db
      .select({
        catId: table.cat.id,
        servantId: table.cat.servantId,
        name: table.cat.name,
        fcmToken: table.fcmToken.token,
      })
      .from(table.cat)
      .innerJoin(table.fcmToken, eq(table.cat.servantId, table.fcmToken.userId))
      .where(
        or(isNull(table.cat.lastCaredAt), lt(table.cat.lastCaredAt, threshold)),
      );
  }
}
