import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const fighterStats = v.object({
  name: v.string(),
  power: v.number(),
  speed: v.number(),
  tactics: v.number(),
  durability: v.number(),
  chaos: v.number(),
  range: v.optional(v.string()),
  defence: v.optional(v.string()),
  intelligent: v.optional(v.string()),
  developmentPotential: v.optional(v.string()),
  edge: v.string(),
});

const battleRound = v.object({
  title: v.string(),
  narration: v.string(),
  edge: v.string(),
  interference: v.optional(v.string()),
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    fighterA: v.string(),
    fighterB: v.string(),
    fighterADescription: v.string(),
    fighterBDescription: v.string(),
    environment: v.string(),
    weapon: v.string(),
    constraint: v.string(),
    title: v.string(),
    stats: v.object({
      fighterA: fighterStats,
      fighterB: fighterStats,
    }),
    rounds: v.array(battleRound),
    winner: v.string(),
    explanation: v.string(),
    controversyScore: v.number(),
    fighterAImageStorageId: v.optional(v.id("_storage")),
    fighterBImageStorageId: v.optional(v.id("_storage")),
    imageProvider: v.union(v.literal("openai"), v.literal("fallback")),
    status: v.union(v.literal("ongoing"), v.literal("finished")),
    ownerEmail: v.optional(v.string()),
    ownerName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("battles", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const appendRound = mutation({
  args: {
    id: v.id("battles"),
    round: battleRound,
    winner: v.string(),
    explanation: v.string(),
    controversyScore: v.number(),
    status: v.union(v.literal("ongoing"), v.literal("finished")),
    interference: v.string(),
    authorName: v.string(),
  },
  handler: async (ctx, args) => {
    const battle = await ctx.db.get(args.id);
    if (!battle) {
      throw new Error("Battle not found.");
    }

    await ctx.db.patch(args.id, {
      rounds: [...battle.rounds, args.round],
      winner: args.winner,
      explanation: args.explanation,
      controversyScore: args.controversyScore,
      status: args.status,
    });

    await ctx.db.insert("interventions", {
      battleId: args.id,
      authorName: args.authorName,
      body: args.interference,
      roundTitle: args.round.title,
      createdAt: Date.now(),
    });
  },
});

export const deleteById = mutation({
  args: {
    id: v.id("battles"),
    requesterEmail: v.optional(v.string()),
  },
  handler: async (ctx, { id, requesterEmail }) => {
    const battle = await ctx.db.get(id);
    if (!battle) {
      return;
    }

    if (battle.ownerEmail && battle.ownerEmail !== requesterEmail) {
      throw new Error("Only the battle owner can delete this battle.");
    }

    const comments = await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("battleId"), id))
      .collect();
    const interventions = await ctx.db
      .query("interventions")
      .filter((q) => q.eq(q.field("battleId"), id))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }
    for (const intervention of interventions) {
      await ctx.db.delete(intervention._id);
    }
    if (battle.fighterAImageStorageId) {
      await ctx.storage.delete(battle.fighterAImageStorageId);
    }
    if (battle.fighterBImageStorageId) {
      await ctx.storage.delete(battle.fighterBImageStorageId);
    }

    await ctx.db.delete(id);
  },
});

export const get = query({
  args: { id: v.id("battles") },
  handler: async (ctx, { id }) => {
    const battle = await ctx.db.get(id);
    if (!battle) {
      return null;
    }

    const [fighterAImageUrl, fighterBImageUrl] = await Promise.all([
      battle.fighterAImageStorageId
        ? ctx.storage.getUrl(battle.fighterAImageStorageId)
        : null,
      battle.fighterBImageStorageId
        ? ctx.storage.getUrl(battle.fighterBImageStorageId)
        : null,
    ]);

    return {
      ...battle,
      fighterADescription: battle.fighterADescription ?? "",
      fighterBDescription: battle.fighterBDescription ?? "",
      status: battle.status ?? "finished",
      fighterAImageUrl,
      fighterBImageUrl,
    };
  },
});

export const listRecent = query({
  args: {},
  handler: async (ctx) => {
    const battles = await ctx.db
      .query("battles")
      .order("desc")
      .take(12);

    return await Promise.all(
      battles.map(async (battle) => ({
        ...battle,
        fighterADescription: battle.fighterADescription ?? "",
        fighterBDescription: battle.fighterBDescription ?? "",
        status: battle.status ?? "finished",
        fighterAImageUrl: battle.fighterAImageStorageId
          ? await ctx.storage.getUrl(battle.fighterAImageStorageId)
          : null,
        fighterBImageUrl: battle.fighterBImageStorageId
          ? await ctx.storage.getUrl(battle.fighterBImageStorageId)
          : null,
      })),
    );
  },
});

export const listForOwner = query({
  args: { ownerEmail: v.string() },
  handler: async (ctx, { ownerEmail }) => {
    const battles = await ctx.db
      .query("battles")
      .filter((q) => q.eq(q.field("ownerEmail"), ownerEmail))
      .order("desc")
      .take(24);

    return await Promise.all(
      battles.map(async (battle) => ({
        ...battle,
        fighterADescription: battle.fighterADescription ?? "",
        fighterBDescription: battle.fighterBDescription ?? "",
        status: battle.status ?? "finished",
        fighterAImageUrl: battle.fighterAImageStorageId
          ? await ctx.storage.getUrl(battle.fighterAImageStorageId)
          : null,
        fighterBImageUrl: battle.fighterBImageStorageId
          ? await ctx.storage.getUrl(battle.fighterBImageStorageId)
          : null,
      })),
    );
  },
});
