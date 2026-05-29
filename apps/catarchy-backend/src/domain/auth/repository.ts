import { and, eq } from "drizzle-orm";

import { getDatabase, table, UserAuthProvider } from "../../infra/db";

export abstract class AuthRepository {
  private static get db() {
    return getDatabase();
  }

  static createEmailAuth({
    email,
    passwordHashed,
    userId,
  }: {
    email: string;
    passwordHashed: string;
    userId: string;
  }) {
    return AuthRepository.db.insert(table.auth).values({
      provider: UserAuthProvider.EMAIL_PASSWORD,
      email,
      password: passwordHashed,
      userId,
    });
  }

  static async findAuthByEmail({ email }: { email: string }) {
    const [auth] = await AuthRepository.db
      .select()
      .from(table.auth)
      .where(and(eq(table.auth.email, email)))
      .limit(1);

    return auth;
  }

  static async updatePassword({
    email,
    passwordHashed,
  }: {
    email: string;
    passwordHashed: string;
  }) {
    await AuthRepository.db
      .update(table.auth)
      .set({ password: passwordHashed })
      .where(eq(table.auth.email, email));
  }

  static async findAuthByUserId({ userId }: { userId: string }) {
    const [auth] = await AuthRepository.db
      .select()
      .from(table.auth)
      .where(and(eq(table.auth.userId, userId)))
      .limit(1);

    return auth;
  }
}
