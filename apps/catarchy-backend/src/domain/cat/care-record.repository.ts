import { and, desc, eq, lt } from "drizzle-orm";

import { getDatabase, table } from "../../infra/db";
import type { CursorQuery } from "../../lib/pagination";

export abstract class CareRecordRepository {
  private static get db() {
    return getDatabase();
  }

  static async findByCursor({
    userId,
    catId,
    cursor,
    limit,
  }: { userId: string; catId: string } & CursorQuery) {
    const careRecords = await CareRecordRepository.db
      .select({
        id: table.careRecord.id,
        catId: table.careRecord.catId,
        servantId: table.careRecord.servantId,
        growth: table.careRecord.growth,
        growthDelta: table.careRecord.growthDelta,
        emotion: table.careRecord.emotion,
        emotionDelta: table.careRecord.emotionDelta,
        message: table.careRecord.message,
        caredAt: table.careRecord.caredAt,
      })
      .from(table.careRecord)
      .where(
        and(
          eq(table.careRecord.servantId, userId),
          eq(table.careRecord.catId, catId),
          cursor ? lt(table.careRecord.id, cursor) : undefined,
        ),
      )
      .orderBy(desc(table.careRecord.id))
      .limit(limit + 1);

    const hasMore = careRecords.length > limit;
    const items = careRecords.slice(0, limit);
    const nextCursor = hasMore ? items[items.length - 1].id : undefined;

    return {
      items,
      nextCursor,
      hasMore,
    };
  }

  static create(params: {
    catId: string;
    servantId: string;
    growthDelta: number;
    emotionDelta: number;
    growth: number;
    emotion: number;
    message?: string;
  }) {
    return CareRecordRepository.db
      .insert(table.careRecord)
      .values({
        ...params,
        caredAt: new Date().toISOString(),
      })
      .returning();
  }

  static async findById({
    id,
    userId,
  }: {
    id: string;
    userId: string;
  }) {
    const [record] = await CareRecordRepository.db
      .select({
        id: table.careRecord.id,
        catId: table.careRecord.catId,
        servantId: table.careRecord.servantId,
        growth: table.careRecord.growth,
        growthDelta: table.careRecord.growthDelta,
        emotion: table.careRecord.emotion,
        emotionDelta: table.careRecord.emotionDelta,
        message: table.careRecord.message,
        caredAt: table.careRecord.caredAt,
      })
      .from(table.careRecord)
      .where(
        and(
          eq(table.careRecord.id, id),
          eq(table.careRecord.servantId, userId),
        ),
      )
      .limit(1);
    return record;
  }

  static async findLatestByCatId({ catId, limit }: { catId: string; limit: number }) {
    return CareRecordRepository.db
      .select({ id: table.careRecord.id })
      .from(table.careRecord)
      .where(eq(table.careRecord.catId, catId))
      .orderBy(desc(table.careRecord.id))
      .limit(limit);
  }

  static updateCareMessage({ id, message }: { id: string; message: string }) {
    return CareRecordRepository.db
      .update(table.careRecord)
      .set({ message })
      .where(eq(table.careRecord.id, id))
      .returning();
  }
}
