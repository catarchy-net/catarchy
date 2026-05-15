import { and, desc, eq, lt } from "drizzle-orm";
import { getDatabase, table } from "../../infra/db";
import type { CursorQuery } from "../../lib/pagination";

export abstract class CareRecordRepository {
  private static get db() {
    return getDatabase();
  }

  static findByCursor({
    userId,
    catId,
    cursor,
    limit,
  }: { userId: string; catId: string } & CursorQuery) {
    return CareRecordRepository.db
      .select({
        id: table.careRecord.id,
        catId: table.careRecord.catId,
        servantId: table.careRecord.servantId,
        growthDelta: table.careRecord.growthDelta,
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
  }

  static create(params: {
    catId: string;
    servantId: string;
    growthDelta: number;
    emotionDelta: number;
    message: string;
  }) {
    return CareRecordRepository.db.insert(table.careRecord).values({
      ...params,
      caredAt: new Date().toISOString(),
    });
  }
}
