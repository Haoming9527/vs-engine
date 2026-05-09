import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const add = mutation({
  args: {
    battleId: v.id("battles"),
    name: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const battle = await ctx.db.get(args.battleId);
    if (!battle) {
      throw new Error("Battle not found.");
    }

    return await ctx.db.insert("comments", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const listForBattle = query({
  args: { battleId: v.id("battles") },
  handler: async (ctx, { battleId }) => {
    return await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("battleId"), battleId))
      .order("desc")
      .take(50);
  },
});
