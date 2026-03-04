import { eq } from "drizzle-orm";
import {
  getDatabase,
  table,
  type Database,
  type Transaction,
} from "../../infra/db";

type Client = Database | Transaction;

export abstract class UserRepository {
  private static get db() {
    return getDatabase();
  }

  static async findById({ id }: { id: string }) {
    const [user] = await this.db
      .select()
      .from(table.user)
      .where(eq(table.user.id, id))
      .limit(1);

    return user;
  }

  static async findByHandle({ handle }: { handle: string }) {
    const [user] = await this.db
      .select()
      .from(table.user)
      .where(eq(table.user.handle, handle))
      .limit(1);

    return user;
  }

  static async createUser({ handle }: { handle: string }, tx?: Client) {
    const client = tx ?? this.db;
    const [user] = await client
      .insert(table.user)
      .values({
        handle,
      })
      .returning();

    return user;
  }
}
