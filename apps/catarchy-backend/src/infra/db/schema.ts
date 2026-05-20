import { ConsensusValueType } from "@catarchy/shared/constants/consensus";
import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";
import { uuidv7 } from "uuidv7";

// ── User ──────────────────────────────────────────────────────────────────────

/** Registered users of the cat world */
export const userTable = sqliteTable("user", {
  id: text("id")
    .$defaultFn(() => uuidv7())
    .primaryKey(),
  handle: text("handle").unique().notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export enum UserAuthProvider {
  EMAIL_PASSWORD = "email_password",
}

/** Authentication credentials per provider (user : auth = 1 : N) */
export const authTable = sqliteTable("auth", {
  id: text("id")
    .$defaultFn(() => uuidv7())
    .primaryKey(),
  provider: text("provider", {
    enum: Object.values(UserAuthProvider) as [string, ...string[]],
  }).notNull(),
  email: text("email").unique(),
  password: text("password"),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

/** Temporary email verification codes issued during registration or sign-in */
export const emailVerificationTable = sqliteTable(
  "email_verification",
  {
    id: text("id")
      .$defaultFn(() => uuidv7())
      .primaryKey(),
    email: text("email").notNull(),
    code: text("code").notNull(),
    expiredAt: integer("expired_at").notNull(),
    verified: integer("verified", { mode: "boolean" }).default(false),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => [index("email_verification_email_idx").on(t.email)],
);

/** Active user sessions identified by refresh token (user : session = 1 : N) */
export const sessionTable = sqliteTable(
  "session",
  {
    id: text("id")
      .$defaultFn(() => uuidv7())
      .primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id),
    refreshToken: text("refresh_token").notNull().unique(),
    expiredAt: integer("expired_at").notNull(),
    absoluteExpiredAt: integer("absolute_expired_at").notNull(),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

// ── Push Notification ─────────────────────────────────────────────────────────

/** FCM push tokens per user for Web Push (PWA) notifications (user : fcmToken = 1 : N) */
export const fcmTokenTable = sqliteTable(
  "fcm_token",
  {
    id: text("id")
      .$defaultFn(() => uuidv7())
      .primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id),
    token: text("token").notNull().unique(),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => [index("fcm_token_user_id_idx").on(t.userId)],
);

// ── Cat ───────────────────────────────────────────────────────────────────────

export enum CatSex {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

/** Cats living in the world, each owned by a user (user : cat = 1 : N) */
export const cat = sqliteTable(
  "cat",
  {
    id: text("id")
      .$defaultFn(() => uuidv7())
      .primaryKey(),
    name: text("name").notNull(),
    sex: text("sex", {
      enum: Object.values(CatSex) as [string, ...string[]],
    }),
    servantId: text("servant_id")
      .notNull()
      .references(() => userTable.id),
    lastCaredAt: text("last_cared_at"),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => [unique("cat_servant_unique").on(t.servantId)],
);

/** Current stat values for a cat (cat : catStat = 1 : 1) */
export const catStat = sqliteTable(
  "cat_stat",
  {
    catId: text("cat_id")
      .primaryKey()
      .references(() => cat.id),
    growth: integer("growth").notNull().default(0),
    emotion: integer("emotion").notNull().default(100),
    updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => [
    check("growth_positive", sql`${t.growth} >= 0`),
    check("emotion_range", sql`${t.emotion} >= 0 AND ${t.emotion} <= 100`),
  ],
);

/** Stat change log for cat_stat; each care interaction appends a delta record (cat : careRecord = 1 : N, servant : careRecord = 1 : N) */
export const careRecord = sqliteTable(
  "cat_care_record",
  {
    id: text("id")
      .$defaultFn(() => uuidv7())
      .primaryKey(),
    catId: text("cat_id")
      .notNull()
      .references(() => cat.id),
    servantId: text("servant_id")
      .notNull()
      .references(() => userTable.id),
    growthDelta: integer("growth_delta").notNull(),
    emotionDelta: integer("emotion_delta").notNull(),
    growth: integer("growth").notNull(),
    emotion: integer("emotion").notNull(),
    message: text("message"),
    caredAt: text("cared_at").default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => [
    index("care_record_cat_id_idx").on(t.catId),
    index("care_record_servant_id_cared_at_idx").on(
      t.servantId,
      t.catId,
      t.caredAt,
    ),
  ],
);

/** Big Five personality trait scores for a cat, derived from personality tests (cat : catPersonality = 1 : 0~1) */
export const catPersonality = sqliteTable(
  "cat_personality",
  {
    catId: text("cat_id")
      .primaryKey()
      .references(() => cat.id),

    openness: integer("openness").notNull(),
    conscientiousness: integer("conscientiousness").notNull(),
    extraversion: integer("extraversion").notNull(),
    agreeableness: integer("agreeableness").notNull(),
    neuroticism: integer("neuroticism").notNull(),

    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => [
    check("openness_range", sql`${t.openness} >= 0 AND ${t.openness} <= 10`),
    check(
      "conscientiousness_range",
      sql`${t.conscientiousness} >= 0 AND ${t.conscientiousness} <= 10`,
    ),
    check(
      "extraversion_range",
      sql`${t.extraversion} >= 0 AND ${t.extraversion} <= 10`,
    ),
    check(
      "agreeableness_range",
      sql`${t.agreeableness} >= 0 AND ${t.agreeableness} <= 10`,
    ),
    check(
      "neuroticism_range",
      sql`${t.neuroticism} >= 0 AND ${t.neuroticism} <= 10`,
    ),
  ],
);

export enum PersonalityQuestionKeyed {
  PLUS = "plus",
  MINUS = "minus",
}

export enum personalityDomain {
  OPENNESS = "openness",
  CONSCIENTIOUSNESS = "conscientiousness",
  EXTRAVERSION = "extraversion",
  AGREEABLENESS = "agreeableness",
  NEUROTICISM = "neuroticism",
}

export const personalityQuestion = sqliteTable("personality_question", {
  id: text("id").primaryKey(),
  text: text("text").notNull(),
  keyed: text("keyed", {
    enum: Object.values(PersonalityQuestionKeyed) as [PersonalityQuestionKeyed, ...PersonalityQuestionKeyed[]],
  }).notNull(),
  domain: text("domain", {
    enum: Object.values(personalityDomain) as [personalityDomain, ...personalityDomain[]],
  }).notNull(),
  descriptionLevel1: text("description_level_1").notNull(),
  descriptionLevel2: text("description_level_2").notNull(),
  descriptionLevel3: text("description_level_3").notNull(),
  descriptionLevel4: text("description_level_4").notNull(),
  descriptionLevel5: text("description_level_5").notNull(),
});

/** Per-question scores for a cat's one-time personality test (catId + questionId = unique pair) */
export const personalityTestAnswer = sqliteTable(
  "personality_test_answer",
  {
    catId: text("cat_id")
      .notNull()
      .references(() => cat.id),
    questionId: text("question_id")
      .notNull()
      .references(() => personalityQuestion.id),
    answer: integer("answer").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.catId, t.questionId] }),
    check("answer_range", sql`${t.answer} >= 1 AND ${t.answer} <= 5`),
    index("personality_test_answer_cat_id_idx").on(t.catId),
  ],
);

export enum CatRelationshipType {
  FRIEND = "FRIEND",
  UNFRIENDED = "UNFRIENDED",
  COUPLE = "COUPLE",
  BREAKUP = "BREAKUP",
  MARRIED = "MARRIED",
  DIVORCED = "DIVORCED",
}

/** Bidirectional relationship between two cats (catId1 < catId2 enforced to prevent duplicates) */
export const catRelationship = sqliteTable(
  "cat_relationship",
  {
    id: text("id")
      .$defaultFn(() => uuidv7())
      .primaryKey(),
    catId1: text("cat_id_1")
      .notNull()
      .references(() => cat.id),
    catId2: text("cat_id_2")
      .notNull()
      .references(() => cat.id),
    type: text("type", {
      enum: Object.values(CatRelationshipType) as [string, ...string[]],
    }).notNull(),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => [
    unique("cat_relationship_unique").on(t.catId1, t.catId2),
    check("cat_relationship_order", sql`${t.catId1} < ${t.catId2}`),
    index("cat_relationship_cat_id_2_idx").on(t.catId2),
  ],
);

/** World-wide game parameters whose values are determined by community voting */
export const consensusTable = sqliteTable("consensus", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  valueType: text("value_type", {
    enum: Object.values(ConsensusValueType) as [string, ...string[]],
  }).notNull(),
  name: text("name").notNull(),
  purpose: text("purpose").notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// ── Chronicle ─────────────────────────────────────────────────────────────────

/** Global event feed broadcasting notable happenings across the cat world (body: JSON stringified) */
export const chronicle = sqliteTable(
  "chronicle",
  {
    id: text("id")
      .$defaultFn(() => uuidv7())
      .primaryKey(),
    body: text("body").notNull(),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => [index("chronicle_created_at_idx").on(t.createdAt)],
);

// ── Relations ─────────────────────────────────────────────────────────────────

export const userRelations = relations(userTable, ({ one, many }) => ({
  auth: many(authTable),
  sessions: many(sessionTable),
  cats: many(cat),
  careRecords: many(careRecord),
  fcmTokens: many(fcmTokenTable),
}));

export const fcmTokenRelations = relations(fcmTokenTable, ({ one }) => ({
  user: one(userTable, {
    fields: [fcmTokenTable.userId],
    references: [userTable.id],
  }),
}));

export const authRelations = relations(authTable, ({ one }) => ({
  user: one(userTable, {
    fields: [authTable.userId],
    references: [userTable.id],
  }),
}));

export const sessionRelations = relations(sessionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [sessionTable.userId],
    references: [userTable.id],
  }),
}));

export const catRelations = relations(cat, ({ one, many }) => ({
  servant: one(userTable, {
    fields: [cat.servantId],
    references: [userTable.id],
  }),
  stat: one(catStat, {
    fields: [cat.id],
    references: [catStat.catId],
  }),
  careRecords: many(careRecord),
  personality: one(catPersonality, {
    fields: [cat.id],
    references: [catPersonality.catId],
  }),
  personalityTestAnswers: many(personalityTestAnswer),
  relationshipsAsCat1: many(catRelationship, { relationName: "cat1" }),
  relationshipsAsCat2: many(catRelationship, { relationName: "cat2" }),
}));

export const catStatRelations = relations(catStat, ({ one, many }) => ({
  cat: one(cat, { fields: [catStat.catId], references: [cat.id] }),
  careRecords: many(careRecord),
}));

export const careRecordRelations = relations(careRecord, ({ one }) => ({
  cat: one(cat, { fields: [careRecord.catId], references: [cat.id] }),
  catStat: one(catStat, {
    fields: [careRecord.catId],
    references: [catStat.catId],
  }),
  servant: one(userTable, {
    fields: [careRecord.servantId],
    references: [userTable.id],
  }),
}));

export const catPersonalityRelations = relations(catPersonality, ({ one }) => ({
  cat: one(cat, { fields: [catPersonality.catId], references: [cat.id] }),
}));

export const personalityTestAnswerRelations = relations(
  personalityTestAnswer,
  ({ one }) => ({
    cat: one(cat, {
      fields: [personalityTestAnswer.catId],
      references: [cat.id],
    }),
    question: one(personalityQuestion, {
      fields: [personalityTestAnswer.questionId],
      references: [personalityQuestion.id],
    }),
  }),
);

export const personalityQuestionRelations = relations(
  personalityQuestion,
  ({ many }) => ({
    answers: many(personalityTestAnswer),
  }),
);

export const catRelationshipRelations = relations(
  catRelationship,
  ({ one }) => ({
    cat1: one(cat, {
      fields: [catRelationship.catId1],
      references: [cat.id],
      relationName: "cat1",
    }),
    cat2: one(cat, {
      fields: [catRelationship.catId2],
      references: [cat.id],
      relationName: "cat2",
    }),
  }),
);

// ── Table export ──────────────────────────────────────────────────────────────

export const table = {
  user: userTable,
  auth: authTable,
  emailVerification: emailVerificationTable,
  session: sessionTable,
  cat: cat,
  catStat: catStat,
  careRecord: careRecord,
  catPersonality: catPersonality,
  personalityQuestion: personalityQuestion,
  personalityTestAnswer: personalityTestAnswer,
  catRelationship: catRelationship,
  fcmToken: fcmTokenTable,
  chronicle: chronicle,
  consensus: consensusTable,
} as const;
export type Table = typeof table;
