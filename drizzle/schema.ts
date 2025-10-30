import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Juwoo profile table - single child profile for the point system
 */
export const juwooProfile = mysqlTable("juwoo_profile", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).default("주우").notNull(),
  currentPoints: int("current_points").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type JuwooProfile = typeof juwooProfile.$inferSelect;
export type InsertJuwooProfile = typeof juwooProfile.$inferInsert;

/**
 * Point rules table - defines all possible ways to earn or lose points
 */
export const pointRules = mysqlTable("point_rules", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", [
    "생활습관", "운동건강", "학습독서", "예의태도", "집안일", 
    "거짓말태도", "시간약속", "생활미준수", "물건관리"
  ]).notNull(),
  pointAmount: int("point_amount").notNull(), // positive for earning, negative for losing
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type PointRule = typeof pointRules.$inferSelect;
export type InsertPointRule = typeof pointRules.$inferInsert;

/**
 * Point transactions table - records all point changes
 */
export const pointTransactions = mysqlTable("point_transactions", {
  id: int("id").autoincrement().primaryKey(),
  juwooId: int("juwoo_id").default(1).notNull(), // always points to the single Juwoo profile
  ruleId: int("rule_id"), // nullable for manual adjustments
  amount: int("amount").notNull(), // positive or negative
  balanceAfter: int("balance_after").notNull(),
  note: text("note"),
  createdBy: int("created_by").notNull(), // admin who created this transaction
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PointTransaction = typeof pointTransactions.$inferSelect;
export type InsertPointTransaction = typeof pointTransactions.$inferInsert;

/**
 * Shop items table - things that can be purchased with points
 */
export const shopItems = mysqlTable("shop_items", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", [
    "게임시간", "장난감", "간식음식", "특별활동", "특권"
  ]).notNull(),
  pointCost: int("point_cost").notNull(),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ShopItem = typeof shopItems.$inferSelect;
export type InsertShopItem = typeof shopItems.$inferInsert;

/**
 * Purchase history table - records all purchases made with points
 */
export const purchases = mysqlTable("purchases", {
  id: int("id").autoincrement().primaryKey(),
  juwooId: int("juwoo_id").default(1).notNull(), // always points to the single Juwoo profile
  itemId: int("item_id").notNull(),
  pointCost: int("point_cost").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "completed"]).default("pending").notNull(),
  note: text("note"),
  approvedBy: int("approved_by"), // admin who approved
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;

/**
 * Goals table - savings goals for motivation
 */
export const goals = mysqlTable("goals", {
  id: int("id").autoincrement().primaryKey(),
  juwooId: int("juwoo_id").default(1).notNull(), // always points to the single Juwoo profile
  title: varchar("title", { length: 255 }).notNull(),
  targetPoints: int("target_points").notNull(),
  currentPoints: int("current_points").default(0).notNull(),
  status: mysqlEnum("status", ["active", "completed", "cancelled"]).default("active").notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = typeof goals.$inferInsert;
