import { and, eq } from "drizzle-orm";

import { getDatabase, table, UserAuthProvider } from "@/infra/db";

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
    return this.db.insert(table.auth).values({
      provider: UserAuthProvider.EMAIL_PASSWORD,
      email,
      password: passwordHashed,
      userId,
    });
  }

  static async findAuthByEmail({ email }: { email: string }) {
    const [auth] = await this.db
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
    await this.db
      .update(table.auth)
      .set({ password: passwordHashed })
      .where(eq(table.auth.email, email));
  }

  static async findAuthByWalletAddress({
    walletAddress,
  }: {
    walletAddress: `0x${string}`;
  }) {
    const [auth] = await this.db
      .select()
      .from(table.auth)
      .where(eq(table.auth.walletAddress, walletAddress))
      .limit(1);

    return auth;
  }

  static createWalletAuth({
    walletAddress,
    userId,
  }: {
    walletAddress: `0x${string}`;
    userId: string;
  }) {
    return this.db.insert(table.auth).values({
      provider: UserAuthProvider.WALLET,
      walletAddress,
      userId,
    });
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
