import {
  and,
  count,
  desc,
  eq,
  gt,
  inArray,
  lt,
  not,
  notExists,
  or,
  sql,
} from "drizzle-orm";

import { CatRelationshipType, getDatabase, table } from "../../infra/db";

export abstract class RelationshipRepository {
  private static get db() {
    return getDatabase();
  }

  // catId1 < catId2 is enforced by schema — always sort before insert/lookup
  // so the composite unique index (catId1, catId2) is used with a single lookup.
  private static order(a: string, b: string): [string, string] {
    return a < b ? [a, b] : [b, a];
  }

  static async create({
    catId,
    targetCatId,
    type,
  }: {
    catId: string;
    targetCatId: string;
    type: CatRelationshipType;
  }) {
    const [catId1, catId2] = this.order(catId, targetCatId);
    const [relationship] = await this.db
      .insert(table.catRelationship)
      .values({ catId1, catId2, type })
      .onConflictDoUpdate({
        target: [table.catRelationship.catId1, table.catRelationship.catId2],
        set: { type, updatedAt: sql`(CURRENT_TIMESTAMP)` },
      })
      .returning();
    await this.db
      .insert(table.catRelationshipHistory)
      .values({ catId, targetCatId, type });
    return relationship;
  }

  private static overviewSelect(catId: string) {
    const otherCatExpr = sql<string>`CASE WHEN ${table.catRelationship.catId1} = ${catId} THEN ${table.catRelationship.catId2} ELSE ${table.catRelationship.catId1} END`;
    const joinExpr = sql`${table.cat.id} = CASE WHEN ${table.catRelationship.catId1} = ${catId} THEN ${table.catRelationship.catId2} ELSE ${table.catRelationship.catId1} END`;
    return this.db
      .select({
        type: table.catRelationship.type,
        createdAt: table.catRelationship.createdAt,
        updatedAt: table.catRelationship.updatedAt,
        catId: otherCatExpr,
        catName: table.cat.name,
        catSex: table.cat.sex,
        growth: table.catStat.growth,
        emotion: table.catStat.emotion,
      })
      .from(table.catRelationship)
      .innerJoin(table.cat, joinExpr)
      .innerJoin(table.catStat, eq(table.catStat.catId, table.cat.id));
  }

  static async findRomance({ catId }: { catId: string }) {
    return this.overviewSelect(catId)
      .where(
        and(
          or(
            eq(table.catRelationship.catId1, catId),
            eq(table.catRelationship.catId2, catId),
          ),
          inArray(table.catRelationship.type, [
            CatRelationshipType.COUPLE,
            CatRelationshipType.MARRIED,
          ]),
        ),
      )
      .orderBy(desc(table.catRelationship.updatedAt));
  }

  static async findRecentFriends({
    catId,
    limit = 3,
  }: {
    catId: string;
    limit?: number;
  }) {
    return this.overviewSelect(catId)
      .where(
        and(
          or(
            eq(table.catRelationship.catId1, catId),
            eq(table.catRelationship.catId2, catId),
          ),
          eq(table.catRelationship.type, CatRelationshipType.FRIEND),
        ),
      )
      .orderBy(desc(table.catRelationship.updatedAt))
      .limit(limit);
  }

  static async countFriends({ catId }: { catId: string }) {
    const [row] = await this.db
      .select({ value: count() })
      .from(table.catRelationship)
      .where(
        and(
          or(
            eq(table.catRelationship.catId1, catId),
            eq(table.catRelationship.catId2, catId),
          ),
          eq(table.catRelationship.type, CatRelationshipType.FRIEND),
        ),
      );
    return row?.value ?? 0;
  }

  static async findFriendsCursor({
    catId,
    cursor,
    limit,
  }: {
    catId: string;
    cursor?: string;
    limit: number;
  }) {
    const rows = await this.db
      .select({
        id: table.catRelationship.id,
        type: table.catRelationship.type,
        updatedAt: table.catRelationship.updatedAt,
        catId: sql<string>`CASE WHEN ${table.catRelationship.catId1} = ${catId} THEN ${table.catRelationship.catId2} ELSE ${table.catRelationship.catId1} END`,
        catName: table.cat.name,
        catSex: table.cat.sex,
        growth: table.catStat.growth,
        emotion: table.catStat.emotion,
      })
      .from(table.catRelationship)
      .innerJoin(
        table.cat,
        sql`${table.cat.id} = CASE WHEN ${table.catRelationship.catId1} = ${catId} THEN ${table.catRelationship.catId2} ELSE ${table.catRelationship.catId1} END`,
      )
      .innerJoin(table.catStat, eq(table.catStat.catId, table.cat.id))
      .where(
        and(
          or(
            eq(table.catRelationship.catId1, catId),
            eq(table.catRelationship.catId2, catId),
          ),
          eq(table.catRelationship.type, CatRelationshipType.FRIEND),
          cursor ? lt(table.catRelationship.id, cursor) : undefined,
        ),
      )
      .orderBy(desc(table.catRelationship.id))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit);
    return {
      items,
      nextCursor: hasMore ? items[items.length - 1].id : undefined,
      hasMore,
    };
  }

  static async findBetween({
    catId,
    targetCatId,
  }: {
    catId: string;
    targetCatId: string;
  }) {
    const [catId1, catId2] = this.order(catId, targetCatId);
    const [relationship] = await this.db
      .select()
      .from(table.catRelationship)
      .where(
        and(
          eq(table.catRelationship.catId1, catId1),
          eq(table.catRelationship.catId2, catId2),
        ),
      )
      .limit(1);
    return relationship;
  }

  static async findFriendCandidates({ catId }: { catId: string }) {
    return this.db
      .select({
        catId: table.catPersonality.catId,
        sex: table.cat.sex,
        openness: table.catPersonality.openness,
        conscientiousness: table.catPersonality.conscientiousness,
        extraversion: table.catPersonality.extraversion,
        agreeableness: table.catPersonality.agreeableness,
        neuroticism: table.catPersonality.neuroticism,
        remainingCount: table.catPersonality.remainingCount,
      })
      .from(table.catPersonality)
      .innerJoin(table.cat, eq(table.catPersonality.catId, table.cat.id))
      .where(
        and(
          not(eq(table.catPersonality.catId, catId)),
          eq(table.catPersonality.remainingCount, 0),
          notExists(
            this.relationshipWith(catId, [
              CatRelationshipType.FRIEND,
              CatRelationshipType.COUPLE,
              CatRelationshipType.MARRIED,
            ]),
          ),
        ),
      )
      .orderBy(sql`RANDOM()`)
      .limit(3);
  }

  static async findLoveCandidates({ catId }: { catId: string }) {
    return this.db
      .select({
        catId: table.catPersonality.catId,
        sex: table.cat.sex,
        openness: table.catPersonality.openness,
        conscientiousness: table.catPersonality.conscientiousness,
        extraversion: table.catPersonality.extraversion,
        agreeableness: table.catPersonality.agreeableness,
        neuroticism: table.catPersonality.neuroticism,
        remainingCount: table.catPersonality.remainingCount,
      })
      .from(table.catPersonality)
      .innerJoin(table.cat, eq(table.catPersonality.catId, table.cat.id))
      .where(
        and(
          not(eq(table.catPersonality.catId, catId)),
          eq(table.catPersonality.remainingCount, 0),
          notExists(
            this.relationshipWith(catId, [
              CatRelationshipType.COUPLE,
              CatRelationshipType.MARRIED,
            ]),
          ),
          notExists(this.activeRomanceOf()),
        ),
      )
      .orderBy(sql`RANDOM()`)
      .limit(3);
  }

  static async findHistory({
    catId,
    after,
    before,
    limit,
  }: {
    catId: string;
    after: string;
    before?: string;
    limit?: number;
  }) {
    return this.db
      .select({
        id: table.catRelationshipHistory.id,
        catId: sql<string>`CASE WHEN ${table.catRelationshipHistory.catId} = ${catId} THEN ${table.catRelationshipHistory.targetCatId} ELSE ${table.catRelationshipHistory.catId} END`,
        catName: table.cat.name,
        catSex: table.cat.sex,
        growth: table.catStat.growth,
        emotion: table.catStat.emotion,
        type: table.catRelationshipHistory.type,
        createdAt: table.catRelationshipHistory.createdAt,
      })
      .from(table.catRelationshipHistory)
      .innerJoin(
        table.cat,
        sql`${table.cat.id} = CASE WHEN ${table.catRelationshipHistory.catId} = ${catId} THEN ${table.catRelationshipHistory.targetCatId} ELSE ${table.catRelationshipHistory.catId} END`,
      )
      .innerJoin(table.catStat, eq(table.catStat.catId, table.cat.id))
      .where(
        and(
          or(
            eq(table.catRelationshipHistory.catId, catId),
            eq(table.catRelationshipHistory.targetCatId, catId),
          ),
          gt(table.catRelationshipHistory.id, after),
          before ? lt(table.catRelationshipHistory.id, before) : undefined,
        ),
      )
      .orderBy(table.catRelationshipHistory.id)
      .limit(limit ?? 100);
  }

  static async findHistoryCursor({
    catId,
    cursor,
    limit,
  }: {
    catId: string;
    cursor?: string;
    limit: number;
  }) {
    const rows = await this.db
      .select({
        id: table.catRelationshipHistory.id,
        catId: sql<string>`CASE WHEN ${table.catRelationshipHistory.catId} = ${catId} THEN ${table.catRelationshipHistory.targetCatId} ELSE ${table.catRelationshipHistory.catId} END`,
        catName: table.cat.name,
        catSex: table.cat.sex,
        growth: table.catStat.growth,
        emotion: table.catStat.emotion,
        type: table.catRelationshipHistory.type,
        createdAt: table.catRelationshipHistory.createdAt,
      })
      .from(table.catRelationshipHistory)
      .innerJoin(
        table.cat,
        sql`${table.cat.id} = CASE WHEN ${table.catRelationshipHistory.catId} = ${catId} THEN ${table.catRelationshipHistory.targetCatId} ELSE ${table.catRelationshipHistory.catId} END`,
      )
      .innerJoin(table.catStat, eq(table.catStat.catId, table.cat.id))
      .where(
        and(
          or(
            eq(table.catRelationshipHistory.catId, catId),
            eq(table.catRelationshipHistory.targetCatId, catId),
          ),
          cursor ? lt(table.catRelationshipHistory.id, cursor) : undefined,
        ),
      )
      .orderBy(desc(table.catRelationshipHistory.id))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit);
    return {
      items,
      nextCursor: hasMore ? items[items.length - 1].id : undefined,
      hasMore,
    };
  }

  static async hasActiveRomance({
    catId,
  }: {
    catId: string;
  }): Promise<boolean> {
    const [row] = await this.db
      .select({ id: table.catRelationship.id })
      .from(table.catRelationship)
      .where(
        and(
          or(
            eq(table.catRelationship.catId1, catId),
            eq(table.catRelationship.catId2, catId),
          ),
          inArray(table.catRelationship.type, [
            CatRelationshipType.COUPLE,
            CatRelationshipType.MARRIED,
          ]),
        ),
      )
      .limit(1);
    return !!row;
  }

  static async findUnfriendedIds({
    catId,
  }: {
    catId: string;
  }): Promise<string[]> {
    const rows = await this.db
      .select({
        otherCatId: sql<string>`CASE WHEN cat_id_1 = ${catId} THEN cat_id_2 ELSE cat_id_1 END`,
      })
      .from(table.catRelationship)
      .where(
        and(
          or(
            eq(table.catRelationship.catId1, catId),
            eq(table.catRelationship.catId2, catId),
          ),
          eq(table.catRelationship.type, CatRelationshipType.UNFRIENDED),
        ),
      );
    return rows.map((r) => r.otherCatId);
  }

  // Correlated subquery: returns a row if the candidate already has a relationship
  // of one of the given types with myId.
  private static relationshipWith(myId: string, types: CatRelationshipType[]) {
    return this.db
      .select({ id: table.catRelationship.id })
      .from(table.catRelationship)
      .where(
        and(
          or(
            and(
              eq(table.catRelationship.catId1, myId),
              eq(table.catRelationship.catId2, table.catPersonality.catId),
            ),
            and(
              eq(table.catRelationship.catId1, table.catPersonality.catId),
              eq(table.catRelationship.catId2, myId),
            ),
          ),
          inArray(table.catRelationship.type, types),
        ),
      );
  }

  // Correlated subquery: returns a row if the candidate already holds an active
  // romantic relationship (COUPLE or MARRIED) with anyone.
  private static activeRomanceOf() {
    return this.db
      .select({ id: table.catRelationship.id })
      .from(table.catRelationship)
      .where(
        and(
          or(
            eq(table.catRelationship.catId1, table.catPersonality.catId),
            eq(table.catRelationship.catId2, table.catPersonality.catId),
          ),
          inArray(table.catRelationship.type, [
            CatRelationshipType.COUPLE,
            CatRelationshipType.MARRIED,
          ]),
        ),
      );
  }
}
