import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  pointRules, InsertPointRule,
  pointTransactions, InsertPointTransaction,
  shopItems, InsertShopItem,
  purchases, InsertPurchase,
  goals, InsertGoal,
  juwooProfile, InsertJuwooProfile
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Juwoo's profile ID (always 1)
const JUWOO_ID = 1;

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

// Juwoo Profile
export async function getOrCreateJuwooProfile() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(juwooProfile).where(eq(juwooProfile.id, JUWOO_ID)).limit(1);
  
  if (result.length > 0) {
    return result[0];
  }
  
  // Create Juwoo's profile if it doesn't exist
  await db.insert(juwooProfile).values({
    id: JUWOO_ID,
    name: "주우",
    currentPoints: 0,
  });
  
  const newResult = await db.select().from(juwooProfile).where(eq(juwooProfile.id, JUWOO_ID)).limit(1);
  return newResult[0];
}

export async function updateJuwooPoints(points: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(juwooProfile)
    .set({ currentPoints: points, updatedAt: new Date() })
    .where(eq(juwooProfile.id, JUWOO_ID));
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
export async function getJuwooPointBalance() {
  const profile = await getOrCreateJuwooProfile();
  return profile.currentPoints;
}

export async function createPointTransaction(transaction: Omit<InsertPointTransaction, 'juwooId'> & { juwooId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const txData = {
    ...transaction,
    juwooId: JUWOO_ID,
  };
  
  const result = await db.insert(pointTransactions).values(txData);
  
  // Update Juwoo's current points
  await updateJuwooPoints(transaction.balanceAfter);
  
  return result;
}

export async function getJuwooTransactions(limit = 50) {
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
  .where(eq(pointTransactions.juwooId, JUWOO_ID))
  .orderBy(desc(pointTransactions.createdAt))
  .limit(limit);
}

export async function getTransactionStats(days = 7) {
  const db = await getDb();
  if (!db) return { earned: 0, spent: 0, count: 0 };
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const transactions = await db.select()
    .from(pointTransactions)
    .where(
      and(
        eq(pointTransactions.juwooId, JUWOO_ID),
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
export async function createPurchase(purchase: Omit<InsertPurchase, 'juwooId'> & { juwooId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const purchaseData = {
    ...purchase,
    juwooId: JUWOO_ID,
  };
  
  const result = await db.insert(purchases).values(purchaseData);
  return result;
}

export async function getJuwooPurchases() {
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
  .where(eq(purchases.juwooId, JUWOO_ID))
  .orderBy(desc(purchases.createdAt));
}

export async function getPendingPurchases() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    id: purchases.id,
    juwooId: purchases.juwooId,
    itemName: shopItems.name,
    pointCost: purchases.pointCost,
    status: purchases.status,
    note: purchases.note,
    createdAt: purchases.createdAt,
  })
  .from(purchases)
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
export async function getJuwooGoals() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(goals)
    .where(eq(goals.juwooId, JUWOO_ID))
    .orderBy(desc(goals.createdAt));
}

export async function createGoal(goal: Omit<InsertGoal, 'juwooId'> & { juwooId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const goalData = {
    ...goal,
    juwooId: JUWOO_ID,
  };
  
  const result = await db.insert(goals).values(goalData);
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
