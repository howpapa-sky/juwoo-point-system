import { pgTable, serial, varchar, text, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";

/**
 * PostgreSQL enums
 */
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const categoryEnum = pgEnum("category", [
  "생활습관", "운동건강", "학습독서", "예의태도", "집안일", 
  "거짓말태도", "시간약속", "생활미준수", "물건관리"
]);
export const shopCategoryEnum = pgEnum("shop_category", [
  "게임시간", "장난감", "간식음식", "특별활동", "특권"
]);
export const purchaseStatusEnum = pgEnum("purchase_status", ["pending", "approved", "rejected", "completed"]);
export const goalStatusEnum = pgEnum("goal_status", ["active", "completed", "cancelled"]);
export const learningStatusEnum = pgEnum("learning_status", ["learning", "mastered"]);
export const badgeCategoryEnum = pgEnum("badge_category", ["points", "learning", "streak", "special"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("open_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("login_method", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Juwoo profile table - single child profile for the point system
 */
export const juwooProfile = pgTable("juwoo_profile", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).default("주우").notNull(),
  currentPoints: integer("current_points").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type JuwooProfile = typeof juwooProfile.$inferSelect;
export type InsertJuwooProfile = typeof juwooProfile.$inferInsert;

/**
 * Point rules table - defines all possible ways to earn or lose points
 */
export const pointRules = pgTable("point_rules", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: categoryEnum("category").notNull(),
  pointAmount: integer("point_amount").notNull(), // positive for earning, negative for losing
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PointRule = typeof pointRules.$inferSelect;
export type InsertPointRule = typeof pointRules.$inferInsert;

/**
 * Point transactions table - records all point changes
 */
export const pointTransactions = pgTable("point_transactions", {
  id: serial("id").primaryKey(),
  juwooId: integer("juwoo_id").default(1).notNull(), // always points to the single Juwoo profile
  ruleId: integer("rule_id"), // nullable for manual adjustments
  amount: integer("amount").notNull(), // positive or negative
  balanceAfter: integer("balance_after").notNull(),
  note: text("note"),
  createdBy: integer("created_by").notNull(), // admin who created this transaction
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PointTransaction = typeof pointTransactions.$inferSelect;
export type InsertPointTransaction = typeof pointTransactions.$inferInsert;

/**
 * Shop items table - things that can be purchased with points
 */
export const shopItems = pgTable("shop_items", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: shopCategoryEnum("category").notNull(),
  pointCost: integer("point_cost").notNull(),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ShopItem = typeof shopItems.$inferSelect;
export type InsertShopItem = typeof shopItems.$inferInsert;

/**
 * Purchase history table - records all purchases made with points
 */
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  juwooId: integer("juwoo_id").default(1).notNull(), // always points to the single Juwoo profile
  itemId: integer("item_id").notNull(),
  pointCost: integer("point_cost").notNull(),
  status: purchaseStatusEnum("status").default("pending").notNull(),
  note: text("note"),
  approvedBy: integer("approved_by"), // admin who approved
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;

/**
 * Goals table - savings goals for motivation
 */
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  juwooId: integer("juwoo_id").default(1).notNull(), // always points to the single Juwoo profile
  title: varchar("title", { length: 255 }).notNull(),
  targetPoints: integer("target_points").notNull(),
  currentPoints: integer("current_points").default(0).notNull(),
  status: goalStatusEnum("status").default("active").notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = typeof goals.$inferInsert;

/**
 * English words table - vocabulary for learning
 */
export const englishWords = pgTable("english_words", {
  id: serial("id").primaryKey(),
  word: varchar("word", { length: 100 }).notNull(),
  korean: varchar("korean", { length: 100 }).notNull(),
  level: integer("level").default(1).notNull(), // 1=beginner, 2=intermediate, 3=advanced
  category: varchar("category", { length: 50 }).notNull(),
  exampleSentence: text("example_sentence"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type EnglishWord = typeof englishWords.$inferSelect;
export type InsertEnglishWord = typeof englishWords.$inferInsert;

/**
 * Word learning progress table - tracks which words Juwoo has learned
 */
export const wordLearningProgress = pgTable("word_learning_progress", {
  id: serial("id").primaryKey(),
  juwooId: integer("juwoo_id").default(1).notNull(),
  wordId: integer("word_id").notNull(),
  status: learningStatusEnum("status").default("learning").notNull(),
  correctCount: integer("correct_count").default(0).notNull(),
  incorrectCount: integer("incorrect_count").default(0).notNull(),
  lastPracticedAt: timestamp("last_practiced_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type WordLearningProgress = typeof wordLearningProgress.$inferSelect;
export type InsertWordLearningProgress = typeof wordLearningProgress.$inferInsert;

/**
 * Badges table - achievements and milestones
 */
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }), // emoji or icon name
  category: badgeCategoryEnum("category").notNull(),
  requirement: integer("requirement").notNull(), // threshold to earn (e.g., 1000 points, 10 days streak)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

/**
 * User badges table - tracks which badges Juwoo has earned
 */
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  juwooId: integer("juwoo_id").default(1).notNull(),
  badgeId: integer("badge_id").notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;
