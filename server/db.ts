import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  pointRules, InsertPointRule,
  pointTransactions, InsertPointTransaction,
  shopItems, InsertShopItem,
  purchases, InsertPurchase,
  goals, InsertGoal
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Point Rules
export async function getAllPointRules() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(pointRules).where(eq(pointRules.isActive, true));
}

export async function createPointRule(rule: InsertPointRule) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(pointRules).values(rule);
  return result;
}

// Point Transactions
export async function getUserPointBalance(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select({ balance: pointTransactions.balanceAfter })
    .from(pointTransactions)
    .where(eq(pointTransactions.userId, userId))
    .orderBy(desc(pointTransactions.createdAt))
    .limit(1);
  
  return result.length > 0 ? result[0].balance : 0;
}

export async function createPointTransaction(transaction: InsertPointTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(pointTransactions).values(transaction);
  return result;
}

export async function getUserTransactions(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    id: pointTransactions.id,
    amount: pointTransactions.amount,
    balanceAfter: pointTransactions.balanceAfter,
    note: pointTransactions.note,
    createdAt: pointTransactions.createdAt,
    ruleName: pointRules.name,
    ruleCategory: pointRules.category,
  })
  .from(pointTransactions)
  .leftJoin(pointRules, eq(pointTransactions.ruleId, pointRules.id))
  .where(eq(pointTransactions.userId, userId))
  .orderBy(desc(pointTransactions.createdAt))
  .limit(limit);
}

export async function getTransactionStats(userId: number, days = 7) {
  const db = await getDb();
  if (!db) return { earned: 0, spent: 0, count: 0 };
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const transactions = await db.select()
    .from(pointTransactions)
    .where(
      and(
        eq(pointTransactions.userId, userId),
        sql`${pointTransactions.createdAt} >= ${cutoffDate}`
      )
    );
  
  const earned = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const spent = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
  
  return { earned, spent, count: transactions.length };
}

// Shop Items
export async function getAllShopItems() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(shopItems).where(eq(shopItems.isAvailable, true));
}

export async function getShopItemById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(shopItems).where(eq(shopItems.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createShopItem(item: InsertShopItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(shopItems).values(item);
  return result;
}

// Purchases
export async function createPurchase(purchase: InsertPurchase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(purchases).values(purchase);
  return result;
}

export async function getUserPurchases(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    id: purchases.id,
    itemName: shopItems.name,
    pointCost: purchases.pointCost,
    status: purchases.status,
    note: purchases.note,
    createdAt: purchases.createdAt,
    approvedAt: purchases.approvedAt,
  })
  .from(purchases)
  .leftJoin(shopItems, eq(purchases.itemId, shopItems.id))
  .where(eq(purchases.userId, userId))
  .orderBy(desc(purchases.createdAt));
}

export async function getPendingPurchases() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    id: purchases.id,
    userId: purchases.userId,
    userName: users.name,
    itemName: shopItems.name,
    pointCost: purchases.pointCost,
    status: purchases.status,
    note: purchases.note,
    createdAt: purchases.createdAt,
  })
  .from(purchases)
  .leftJoin(users, eq(purchases.userId, users.id))
  .leftJoin(shopItems, eq(purchases.itemId, shopItems.id))
  .where(eq(purchases.status, "pending"))
  .orderBy(desc(purchases.createdAt));
}

export async function updatePurchaseStatus(
  purchaseId: number, 
  status: "approved" | "rejected" | "completed", 
  approvedBy: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.update(purchases)
    .set({ 
      status, 
      approvedBy, 
      approvedAt: new Date() 
    })
    .where(eq(purchases.id, purchaseId));
  
  return result;
}

// Goals
export async function getUserGoals(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(goals)
    .where(eq(goals.userId, userId))
    .orderBy(desc(goals.createdAt));
}

export async function createGoal(goal: InsertGoal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(goals).values(goal);
  return result;
}

export async function updateGoalProgress(goalId: number, currentPoints: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.update(goals)
    .set({ currentPoints, updatedAt: new Date() })
    .where(eq(goals.id, goalId));
  
  return result;
}
