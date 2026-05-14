import { eq, inArray } from "drizzle-orm";
import { getDatabase, table } from "../../infra/db";

export abstract class NotificationRepository {
  private static get db() {
    return getDatabase();
  }

  static async upsertFcmToken({
    userId,
    token,
  }: {
    userId: string;
    token: string;
  }) {
    const [row] = await this.db
      .insert(table.fcmToken)
      .values({ userId, token })
      .onConflictDoUpdate({
        target: table.fcmToken.token,
        set: { userId, updatedAt: new Date().toISOString() },
      })
      .returning();

    return row;
  }

  static async deleteFcmToken({ token }: { token: string }) {
    await this.db.delete(table.fcmToken).where(eq(table.fcmToken.token, token));
  }

  static async deleteFcmTokens({ tokens }: { tokens: string[] }) {
    await this.db
      .delete(table.fcmToken)
      .where(inArray(table.fcmToken.token, tokens));
  }

  static async findTokensByUserId({ userId }: { userId: string }) {
    return this.db
      .select()
      .from(table.fcmToken)
      .where(eq(table.fcmToken.userId, userId));
  }

  static async findAllTokens() {
    return this.db.select().from(table.fcmToken);
  }
}
