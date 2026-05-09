import { api } from "@/convex/_generated/api";
import type { FunctionReference } from "convex/server";

type MutationRef<Args extends Record<string, unknown>, Return> =
  FunctionReference<"mutation", "public", Args, Return>;

type QueryRef<Args extends Record<string, unknown>, Return> =
  FunctionReference<"query", "public", Args, Return>;

type BattleCreateArgs = Record<string, unknown>;
type CommentAddArgs = {
  battleId: string;
  name: string;
  body: string;
};

type AppendRoundArgs = {
  id: string;
  round: import("@/lib/types").BattleRound;
  winner: string;
  explanation: string;
  controversyScore: number;
  status: "ongoing" | "finished";
  interference: string;
  authorName: string;
};

type DeleteBattleArgs = {
  id: string;
  requesterEmail?: string;
};

export type BattleRecord = {
  _id: string;
  fighterA: string;
  fighterB: string;
  fighterADescription: string;
  fighterBDescription: string;
  environment: string;
  weapon: string;
  constraint: string;
  title: string;
  stats: {
    fighterA: import("@/lib/types").FighterStat;
    fighterB: import("@/lib/types").FighterStat;
  };
  rounds: import("@/lib/types").BattleRound[];
  winner: string;
  explanation: string;
  controversyScore: number;
  fighterAImageUrl?: string | null;
  fighterBImageUrl?: string | null;
  status: "ongoing" | "finished";
  ownerEmail?: string;
  ownerName?: string;
  createdAt: number;
};

export type CommentRecord = {
  _id: string;
  name: string;
  body: string;
  createdAt: number;
};

export type InterventionRecord = {
  _id: string;
  authorName: string;
  body: string;
  roundTitle: string;
  createdAt: number;
};

export const convexApi = api as unknown as {
  battles: {
    create: MutationRef<BattleCreateArgs, string>;
    appendRound: MutationRef<AppendRoundArgs, null>;
    deleteById: MutationRef<DeleteBattleArgs, null>;
    generateUploadUrl: MutationRef<Record<string, never>, string>;
    get: QueryRef<{ id: string }, BattleRecord | null>;
    listRecent: QueryRef<Record<string, never>, BattleRecord[]>;
    listForOwner: QueryRef<{ ownerEmail: string }, BattleRecord[]>;
  };
  comments: {
    add: MutationRef<CommentAddArgs, string>;
    listForBattle: QueryRef<{ battleId: string }, CommentRecord[]>;
  };
  interventions: {
    listForBattle: QueryRef<{ battleId: string }, InterventionRecord[]>;
  };
};
