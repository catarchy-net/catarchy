import { eq, and, desc, gt } from "drizzle-orm";
import {
  getDatabase,
  table,
  type Database,
  type Transaction,
} from "../../infra/db";

type Client = Database | Transaction;

export abstract class EmailVerificationRepository {
  private static get db() {
    return getDatabase();
  }

  static async findRecentVerification({ email }: { email: string }) {
    const [existing] = await this.db
      .select()
      .from(table.emailVerification)
      .where(
        and(
          eq(table.emailVerification.email, email),
          eq(table.emailVerification.verified, false),
        ),
      )
      .orderBy(desc(table.emailVerification.createdAt))
      .limit(1);

    return existing;
  }

  static async findValidVerification({
    email,
    code,
  }: {
    email: string;
    code: string;
  }) {
    const [record] = await this.db
      .select()
      .from(table.emailVerification)
      .where(
        and(
          eq(table.emailVerification.email, email),
          eq(table.emailVerification.code, code),
          eq(table.emailVerification.verified, false),
          gt(table.emailVerification.expiredAt, Date.now()),
        ),
      )
      .orderBy(desc(table.emailVerification.createdAt))
      .limit(1);

    return record;
  }

  static async findVerificationByEmailAndCode({
    email,
    code,
  }: {
    email: string;
    code: string;
  }) {
    const [record] = await this.db
      .select()
      .from(table.emailVerification)
      .where(
        and(
          eq(table.emailVerification.email, email),
          eq(table.emailVerification.code, code),
        ),
      )
      .orderBy(desc(table.emailVerification.createdAt))
      .limit(1);

    return record;
  }

  static async findVerifiedEmailRecord({ email }: { email: string }) {
    const [record] = await this.db
      .select()
      .from(table.emailVerification)
      .where(
        and(
          eq(table.emailVerification.email, email),
          eq(table.emailVerification.verified, true),
          gt(table.emailVerification.expiredAt, Date.now()),
        ),
      )
      .orderBy(desc(table.emailVerification.createdAt))
      .limit(1);

    return record;
  }

  static async createEmailVerification({
    email,
    code,
    expiredAt,
  }: {
    email: string;
    code: string;
    expiredAt: number;
  }) {
    const [row] = await this.db
      .insert(table.emailVerification)
      .values({
        email,
        code,
        expiredAt,
      })
      .returning();

    return row;
  }

  static async updateVerificationAsUsed(id: string) {
    const [row] = await this.db
      .update(table.emailVerification)
      .set({ verified: true, updatedAt: new Date().toISOString() })
      .where(
        and(
          eq(table.emailVerification.id, id),
          eq(table.emailVerification.verified, false),
        ),
      )
      .returning();

    return row;
  }

  static async deleteVerificationById(id: string) {
    await this.db
      .delete(table.emailVerification)
      .where(eq(table.emailVerification.id, id));
  }

  static async deleteVerificationByEmail(email: string, tx?: Client) {
    const client = tx ?? this.db;
    await client
      .delete(table.emailVerification)
      .where(eq(table.emailVerification.email, email));
  }
}
