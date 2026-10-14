import { and, eq } from "drizzle-orm";

import { getDatabase, table, UserAuthProvider } from "@/infra/db";

export abstract class AuthRepository {
  private static get db() {
    return getDatabase();
  }

  static async findAuthByUserId({ userId }: { userId: string }) {
    const [auth] = await AuthRepository.db
      .select()
      .from(table.auth)
      .where(and(eq(table.auth.userId, userId)))
      .limit(1);

    return auth;
  }

  static async findAuthByRemiliaUsername({
    remiliaUsername,
  }: {
    remiliaUsername: string;
  }) {
    const [auth] = await this.db
      .select()
      .from(table.auth)
      .where(eq(table.auth.remiliaUsername, remiliaUsername))
      .limit(1);

    return auth;
  }

  static createRemiliaAuth({
    remiliaDisplayName,
    remiliaUsername,
    userId,
  }: {
    remiliaDisplayName: string;
    remiliaUsername: string;
    userId: string;
  }) {
    return this.db.insert(table.auth).values({
      provider: UserAuthProvider.REMILIANET,
      remiliaDisplayName,
      remiliaUsername,
      userId,
    });
  }

  static updateRemiliaDisplayName({
    remiliaDisplayName,
    remiliaUsername,
  }: {
    remiliaDisplayName: string;
    remiliaUsername: string;
  }) {
    return this.db
      .update(table.auth)
      .set({ remiliaDisplayName })
      .where(eq(table.auth.remiliaUsername, remiliaUsername));
  }
}
