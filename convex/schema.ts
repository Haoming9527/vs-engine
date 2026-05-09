import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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

export default defineSchema({
  battles: defineTable({
    fighterA: v.string(),
    fighterB: v.string(),
    fighterADescription: v.optional(v.string()),
    fighterBDescription: v.optional(v.string()),
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
    status: v.optional(v.union(v.literal("ongoing"), v.literal("finished"))),
    ownerEmail: v.optional(v.string()),
    ownerName: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_owner", ["ownerEmail", "createdAt"]),
  comments: defineTable({
    battleId: v.id("battles"),
    name: v.string(),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_battle", ["battleId", "createdAt"]),
  interventions: defineTable({
    battleId: v.id("battles"),
    authorName: v.string(),
    body: v.string(),
    roundTitle: v.string(),
    createdAt: v.number(),
  }).index("by_battle", ["battleId", "createdAt"]),
});
