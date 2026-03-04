import { and, eq } from "drizzle-orm";
import {
  getDatabase,
  table,
  type Database,
  type Transaction,
} from "../../infra/db";

type Client = Database | Transaction;

export abstract class AuthRepository {
  private static get db() {
    return getDatabase();
  }

  static async createEmailAuth(
    {
      email,
      passwordHashed,
      userId,
    }: {
      email: string;
      passwordHashed: string;
      userId: string;
    },
    tx?: Client,
  ) {
    const client = tx ?? this.db;
    const [auth] = await client
      .insert(table.auth)
      .values({
        provider: "email_password",
        email,
        password: passwordHashed,
        userId,
      })
      .returning();

    return auth;
  }

  static async findAuthByEmail({ email }: { email: string }) {
    const [auth] = await this.db
      .select()
      .from(table.auth)
      .where(and(eq(table.auth.email, email)))
      .limit(1);

    return auth;
  }
}
