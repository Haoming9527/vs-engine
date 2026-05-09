import { v } from "convex/values";
import { query } from "./_generated/server";

export const listForBattle = query({
  args: { battleId: v.id("battles") },
  handler: async (ctx, { battleId }) => {
    return await ctx.db
      .query("interventions")
      .filter((q) => q.eq(q.field("battleId"), battleId))
      .order("desc")
      .take(30);
  },
});
