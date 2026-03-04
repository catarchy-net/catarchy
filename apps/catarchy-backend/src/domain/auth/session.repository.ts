import { eq } from "drizzle-orm";
import { getDatabase, table } from "../../infra/db";

export abstract class SessionRepository {
  private static get db() {
    return getDatabase();
  }

  static async createSession({
    userId,
    refreshToken,
    expiredAt,
  }: {
    userId: string;
    refreshToken: string;
    expiredAt: number;
  }) {
    const [session] = await this.db
      .insert(table.session)
      .values({ userId, refreshToken, expiredAt })
      .returning();

    return session;
  }

  static async findByRefreshToken(refreshToken: string) {
    const [session] = await this.db
      .select()
      .from(table.session)
      .where(eq(table.session.refreshToken, refreshToken))
      .limit(1);

    return session;
  }

  static async deleteByRefreshToken(refreshToken: string) {
    await this.db
      .delete(table.session)
      .where(eq(table.session.refreshToken, refreshToken));
  }

  static async deleteByUserId(userId: string) {
    await this.db.delete(table.session).where(eq(table.session.userId, userId));
  }
}
