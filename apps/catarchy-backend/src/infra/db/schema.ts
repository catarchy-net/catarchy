import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

export const userTable = sqliteTable("user", {
  id: text("id")
    .$defaultFn(() => crypto.randomUUID())
    .primaryKey(),
  handle: text("handle").unique().notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const authTable = sqliteTable("auth", {
  id: text("id")
    .$defaultFn(() => crypto.randomUUID())
    .primaryKey(),
  provider: text("provider", { enum: ["email_password"] }).notNull(),
  email: text("email").unique(),
  password: text("password"),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const userAuthRelations = relations(userTable, ({ many }) => ({
  auth: many(authTable),
}));

export const authUserRelations = relations(authTable, ({ one }) => ({
  user: one(userTable, {
    fields: [authTable.userId],
    references: [userTable.id],
  }),
}));

export const emailVerificationTable = sqliteTable("email_verification", {
  id: text("id")
    .$defaultFn(() => crypto.randomUUID())
    .primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiredAt: integer("expired_at").notNull(),
  verified: integer("verified", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const sessionTable = sqliteTable("session", {
  id: text("id")
    .$defaultFn(() => crypto.randomUUID())
    .primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  refreshToken: text("refresh_token").notNull().unique(),
  expiredAt: integer("expired_at").notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const userSessionRelations = relations(userTable, ({ many }) => ({
  sessions: many(sessionTable),
}));

export const sessionUserRelations = relations(sessionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [sessionTable.userId],
    references: [userTable.id],
  }),
}));

export const table = {
  user: userTable,
  auth: authTable,
  emailVerification: emailVerificationTable,
  session: sessionTable,
} as const;
export type Table = typeof table;
