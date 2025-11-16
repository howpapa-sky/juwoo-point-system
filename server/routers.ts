import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { users } from "../drizzle/schema";
import { desc, eq } from "drizzle-orm";
// getDb is not exported from Supabase version

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
      return await db.getJuwooBalance();
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
        // Stats feature to be implemented
        return { totalEarned: 0, totalSpent: 0, netChange: 0 };
      }),

    dailyStats: protectedProcedure
      .input(z.object({
        days: z.number().optional().default(7),
      }))
      .query(async ({ input }) => {
        return await db.getDailyStats(input.days);
      }),

    categoryStats: protectedProcedure.query(async () => {
      return await db.getCategoryStats();
    }),

    add: adminProcedure
      .input(z.object({
        ruleId: z.number().optional(),
        amount: z.number(),
        note: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get current balance
        const currentBalance = await db.getJuwooBalance();
        const newBalance = currentBalance + input.amount;

        // Create transaction
        await db.addPointTransaction({
          ruleId: input.ruleId,
          amount: input.amount,
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
        const balance = await db.getJuwooBalance();
        if (balance < item.pointCost) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: '포인트가 부족합니다.' });
        }

        // Create purchase request
        await db.createPurchase({
          itemId: input.itemId,
          pointCost: item.pointCost,
          note: input.note,
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
        const currentBalance = await db.getJuwooBalance();
        const newBalance = currentBalance - transaction.amount;

        // Create reversal transaction
        await db.addPointTransaction({
          amount: -transaction.amount,
          note: `취소: ${transaction.note || transaction.ruleName || '포인트 변동'}`,
          createdBy: ctx.user.id,
        });

        return { success: true, newBalance };
      }),
  }),

  // Admin - User Management
  admin: router({
    users: adminProcedure.query(async () => {
      return await db.getAllUsers();
    }),

    updateUserRole: adminProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["admin", "user"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateUserRole(input.userId, input.role);
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
          const currentBalance = await db.getJuwooBalance();
          const newBalance = currentBalance - purchase.pointCost;

          // Point transaction is handled in approvePurchase
        }

        // Update purchase status
        if (status === 'approved') {
          await db.approvePurchase(input.purchaseId, ctx.user.id);
        } else {
          await db.rejectPurchase(input.purchaseId, ctx.user.id);
        }

        return { success: true };
      }),
  }),

  // Goals
  english: router({
    randomWord: publicProcedure
      .input(z.object({
        level: z.number().optional().default(1),
      }))
      .query(async ({ input }) => {
        return await db.getRandomEnglishWord(input.level);
      }),
  }),

  // Goals feature removed for now
});

export type AppRouter = typeof appRouter;
