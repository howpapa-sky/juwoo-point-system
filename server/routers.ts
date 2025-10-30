import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { users } from "../drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { getDb } from "./db";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: '관리자 권한이 필요합니다.' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Point Rules
  pointRules: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllPointRules();
    }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        category: z.enum([
          "생활습관", "운동건강", "학습독서", "예의태도", "집안일", 
          "거짓말태도", "시간약속", "생활미준수", "물건관리"
        ]),
        pointAmount: z.number(),
      }))
      .mutation(async ({ input }) => {
        return await db.createPointRule(input);
      }),
  }),

  // Point Transactions (Juwoo's points)
  points: router({
    balance: protectedProcedure.query(async () => {
      return await db.getJuwooPointBalance();
    }),

    transactions: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(50),
      }))
      .query(async ({ input }) => {
        return await db.getJuwooTransactions(input.limit);
      }),

    stats: protectedProcedure
      .input(z.object({
        days: z.number().optional().default(7),
      }))
      .query(async ({ input }) => {
        return await db.getTransactionStats(input.days);
      }),

    add: adminProcedure
      .input(z.object({
        ruleId: z.number().optional(),
        amount: z.number(),
        note: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get current balance
        const currentBalance = await db.getJuwooPointBalance();
        const newBalance = currentBalance + input.amount;

        // Create transaction
        await db.createPointTransaction({
          ruleId: input.ruleId,
          amount: input.amount,
          balanceAfter: newBalance,
          note: input.note,
          createdBy: ctx.user.id,
        });

        return { success: true, newBalance };
      }),
  }),

  // Shop
  shop: router({
    items: protectedProcedure.query(async () => {
      return await db.getAllShopItems();
    }),

    purchase: protectedProcedure
      .input(z.object({
        itemId: z.number(),
        note: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Get item
        const item = await db.getShopItemById(input.itemId);
        if (!item) {
          throw new TRPCError({ code: 'NOT_FOUND', message: '상품을 찾을 수 없습니다.' });
        }

        // Check balance
        const balance = await db.getJuwooPointBalance();
        if (balance < item.pointCost) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: '포인트가 부족합니다.' });
        }

        // Create purchase request
        await db.createPurchase({
          itemId: input.itemId,
          pointCost: item.pointCost,
          note: input.note,
          status: "pending",
        });

        return { success: true, message: '구매 요청이 완료되었습니다. 승인을 기다려주세요.' };
      }),

    myPurchases: protectedProcedure.query(async () => {
      return await db.getJuwooPurchases();
    }),

    createItem: adminProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        category: z.enum(["게임시간", "장난감", "간식음식", "특별활동", "특권"]),
        pointCost: z.number(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createShopItem(input);
      }),
  }),

  // Transaction Management
  transactions: router({
    cancel: adminProcedure
      .input(z.object({
        transactionId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get transaction details
        const transactions = await db.getJuwooTransactions(1000);
        const transaction = transactions.find(t => t.id === input.transactionId);
        
        if (!transaction) {
          throw new TRPCError({ code: 'NOT_FOUND', message: '거래 내역을 찾을 수 없습니다.' });
        }

        // Get current balance
        const currentBalance = await db.getJuwooPointBalance();
        const newBalance = currentBalance - transaction.amount;

        // Create reversal transaction
        await db.createPointTransaction({
          amount: -transaction.amount,
          balanceAfter: newBalance,
          note: `취소: ${transaction.note || transaction.ruleName || '포인트 변동'}`,
          createdBy: ctx.user.id,
        });

        return { success: true, newBalance };
      }),
  }),

  // Admin - User Management
  admin: router({
    users: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(users).orderBy(desc(users.lastSignedIn));
    }),

    updateUserRole: adminProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["admin", "user"]),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '데이터베이스에 연결할 수 없습니다.' });
        
        await db.update(users)
          .set({ role: input.role })
          .where(eq(users.id, input.userId));
        
        return { success: true };
      }),

    pendingPurchases: adminProcedure.query(async () => {
      return await db.getPendingPurchases();
    }),

    approvePurchase: adminProcedure
      .input(z.object({
        purchaseId: z.number(),
        approved: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        const status = input.approved ? "approved" : "rejected";
        
        if (input.approved) {
          // Get purchase details
          const purchases = await db.getPendingPurchases();
          const purchase = purchases.find(p => p.id === input.purchaseId);
          
          if (!purchase) {
            throw new TRPCError({ code: 'NOT_FOUND', message: '구매 요청을 찾을 수 없습니다.' });
          }

          // Deduct points
          const currentBalance = await db.getJuwooPointBalance();
          const newBalance = currentBalance - purchase.pointCost;

          await db.createPointTransaction({
            amount: -purchase.pointCost,
            balanceAfter: newBalance,
            note: `${purchase.itemName} 구매`,
            createdBy: ctx.user.id,
          });
        }

        // Update purchase status
        await db.updatePurchaseStatus(input.purchaseId, status, ctx.user.id);

        return { success: true };
      }),
  }),

  // Goals
  goals: router({
    list: protectedProcedure.query(async () => {
      return await db.getJuwooGoals();
    }),

    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        targetPoints: z.number(),
      }))
      .mutation(async ({ input }) => {
        return await db.createGoal({
          title: input.title,
          targetPoints: input.targetPoints,
          currentPoints: 0,
          status: "active",
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;
