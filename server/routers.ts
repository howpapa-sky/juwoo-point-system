import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

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

  // Point Transactions
  points: router({
    balance: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserPointBalance(ctx.user.id);
    }),

    transactions: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(50),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getUserTransactions(ctx.user.id, input.limit);
      }),

    stats: protectedProcedure
      .input(z.object({
        days: z.number().optional().default(7),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getTransactionStats(ctx.user.id, input.days);
      }),

    add: adminProcedure
      .input(z.object({
        userId: z.number(),
        ruleId: z.number().optional(),
        amount: z.number(),
        note: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get current balance
        const currentBalance = await db.getUserPointBalance(input.userId);
        const newBalance = currentBalance + input.amount;

        // Create transaction
        await db.createPointTransaction({
          userId: input.userId,
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
      .mutation(async ({ ctx, input }) => {
        // Get item
        const item = await db.getShopItemById(input.itemId);
        if (!item) {
          throw new TRPCError({ code: 'NOT_FOUND', message: '상품을 찾을 수 없습니다.' });
        }

        // Check balance
        const balance = await db.getUserPointBalance(ctx.user.id);
        if (balance < item.pointCost) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: '포인트가 부족합니다.' });
        }

        // Create purchase request
        await db.createPurchase({
          userId: ctx.user.id,
          itemId: input.itemId,
          pointCost: item.pointCost,
          note: input.note,
          status: "pending",
        });

        return { success: true, message: '구매 요청이 완료되었습니다. 승인을 기다려주세요.' };
      }),

    myPurchases: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserPurchases(ctx.user.id);
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

  // Admin - Purchase Management
  admin: router({
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
          const currentBalance = await db.getUserPointBalance(purchase.userId);
          const newBalance = currentBalance - purchase.pointCost;

          await db.createPointTransaction({
            userId: purchase.userId,
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
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserGoals(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        targetPoints: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createGoal({
          userId: ctx.user.id,
          title: input.title,
          targetPoints: input.targetPoints,
          currentPoints: 0,
          status: "active",
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;
