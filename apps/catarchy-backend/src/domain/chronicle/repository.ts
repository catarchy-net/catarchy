import {
  ChronicleEvent,
  ChronicleEventType,
} from "@catarchy/shared/constants/chronicle";
import { and, desc, eq, lt } from "drizzle-orm";

import { getDatabase, table } from "@/infra/db";

export abstract class ChronicleRepository {
  private static get db() {
    return getDatabase();
  }

  static async create({
    type,
    body,
  }: {
    type: ChronicleEventType;
    body: ChronicleEvent;
  }) {
    const [row] = await this.db
      .insert(table.chronicle)
      .values({ type, body })
      .returning();
    return row;
  }

  static async findManyCursor({
    cursor,
    limit,
    type,
  }: {
    cursor?: string;
    limit: number;
    type?: ChronicleEventType;
  }) {
    const rows = await this.db
      .select()
      .from(table.chronicle)
      .where(
        and(
          type ? eq(table.chronicle.type, type) : undefined,
          cursor ? lt(table.chronicle.id, cursor) : undefined,
        ),
      )
      .orderBy(desc(table.chronicle.id))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit);
    return {
      items,
      nextCursor: hasMore ? items[items.length - 1].id : undefined,
      hasMore,
    };
  }

  static async findById({ id }: { id: string }) {
    const [row] = await this.db
      .select()
      .from(table.chronicle)
      .where(eq(table.chronicle.id, id))
      .limit(1);
    return row;
  }
}
