import type { BattleInput } from "@/lib/validation";
import type {
  BattleRound,
  BattleSimulation,
  InterventionResult,
  StandRating,
} from "@/lib/types";

type JsonRecord = Record<string, unknown>;

const ratingValues = ["A", "B", "C", "D", "E", "Infinite", "Complete", "None", "?"];

const fighterStatsSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "name",
    "power",
    "speed",
    "tactics",
    "durability",
    "chaos",
    "range",
    "defence",
    "intelligent",
    "developmentPotential",
    "edge",
  ],
  properties: {
    name: { type: "string" },
    power: { type: "number", minimum: 1, maximum: 100 },
    speed: { type: "number", minimum: 1, maximum: 100 },
    tactics: { type: "number", minimum: 1, maximum: 100 },
    durability: { type: "number", minimum: 1, maximum: 100 },
    chaos: { type: "number", minimum: 1, maximum: 100 },
    range: { type: "string", enum: ratingValues },
    defence: { type: "string", enum: ratingValues },
    intelligent: { type: "string", enum: ratingValues },
    developmentPotential: { type: "string", enum: ratingValues },
    edge: { type: "string" },
  },
};

const battleSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "fighterADescription",
    "fighterBDescription",
    "stats",
    "rounds",
    "winner",
    "explanation",
    "controversyScore",
  ],
  properties: {
    title: { type: "string" },
    fighterADescription: { type: "string" },
    fighterBDescription: { type: "string" },
    stats: {
      type: "object",
      additionalProperties: false,
      required: ["fighterA", "fighterB"],
      properties: {
        fighterA: fighterStatsSchema,
        fighterB: fighterStatsSchema,
      },
    },
    rounds: {
      type: "array",
      minItems: 1,
      maxItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "narration", "edge"],
        properties: {
          title: { type: "string" },
          narration: { type: "string" },
          edge: { type: "string" },
        },
      },
    },
    winner: { type: "string" },
    explanation: { type: "string" },
    controversyScore: { type: "number", minimum: 0, maximum: 100 },
  },
};

const interventionSchema = {
  type: "object",
  additionalProperties: false,
  required: ["round", "winner", "explanation", "controversyScore", "status"],
  properties: {
    round: {
      type: "object",
      additionalProperties: false,
      required: ["title", "narration", "edge", "interference"],
      properties: {
        title: { type: "string" },
        narration: { type: "string" },
        edge: { type: "string" },
        interference: { type: "string" },
      },
    },
    winner: { type: "string" },
    explanation: { type: "string" },
    controversyScore: { type: "number", minimum: 0, maximum: 100 },
    status: { type: "string", enum: ["ongoing", "finished"] },
  },
};

export async function generateBattleSimulation(
  input: BattleInput,
): Promise<BattleSimulation> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI is not configured. Add OPENAI_API_KEY to .env.");
  }

  const prompt = [
    "Create a cinematic but non-graphic 'who would win' battle simulation.",
    "Keep it punchy, funny when appropriate, and demo friendly.",
    "Use the exact fighter names from the user.",
    `Fighter A: ${input.fighterA}`,
    `Fighter A dossier from user: ${input.fighterADescription}`,
    `Fighter B: ${input.fighterB}`,
    `Fighter B dossier from user: ${input.fighterBDescription}`,
    `Environment: ${input.environment}`,
    `Weapon/tool modifier: ${input.weapon}`,
    `Rule/constraint: ${input.constraint}`,
    "Generate only the opening round for now. Pick the fighter who wins round one as winner, even though the overall match can remain ongoing.",
    "Write a short 1 sentence fighterADescription and fighterBDescription. If the user supplied a dossier, compress and clarify it. If not, infer useful context from the fighter name so future rounds know who they are.",
    "Rate each fighter with letter stats. Power and speed still include numeric values, while range, defence, intelligent, and developmentPotential use A, B, C, D, E, Infinite, Complete, None, or ?.",
    "Return only the requested JSON shape.",
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_TEXT_MODEL ?? "gpt-4.1-mini",
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "battle_simulation",
          strict: true,
          schema: battleSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI battle generation failed: ${await response.text()}`);
  }

  const data: unknown = await response.json();
  const text = extractResponseText(data);
  if (!text) {
    throw new Error("OpenAI returned an empty battle simulation.");
  }

  return normalizeBattle(JSON.parse(text), input);
}

export async function generateInterventionRound({
  battle,
  interference,
}: {
  battle: {
    fighterA: string;
    fighterB: string;
    fighterADescription: string;
    fighterBDescription: string;
    environment: string;
    weapon: string;
    constraint: string;
    rounds: BattleRound[];
  };
  interference: string;
}): Promise<InterventionResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI is not configured. Add OPENAI_API_KEY to .env.");
  }

  const prompt = [
    "Continue this cinematic, non-graphic VS battle by adding exactly one new round.",
    "The user is interfering with the fight. Make the interference matter, but keep the result fair and entertaining.",
    `Fighter A: ${battle.fighterA}`,
    `Fighter A dossier: ${battle.fighterADescription}`,
    `Fighter B: ${battle.fighterB}`,
    `Fighter B dossier: ${battle.fighterBDescription}`,
    `Environment: ${battle.environment}`,
    `Weapon/tool modifier: ${battle.weapon}`,
    `Rule/constraint: ${battle.constraint}`,
    `Existing rounds: ${JSON.stringify(battle.rounds)}`,
    `User interference: ${interference}`,
    "If this is round 3 or later and there is a decisive outcome, set status to finished and pick a winner. Otherwise keep status ongoing.",
    "Return only the requested JSON shape.",
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_TEXT_MODEL ?? "gpt-4.1-mini",
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "intervention_round",
          strict: true,
          schema: interventionSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI round generation failed: ${await response.text()}`);
  }

  const data: unknown = await response.json();
  const text = extractResponseText(data);
  if (!text) {
    throw new Error("OpenAI returned an empty round.");
  }

  return normalizeIntervention(JSON.parse(text), battle, interference);
}

function extractResponseText(data: unknown) {
  if (!isRecord(data)) return "";
  if (typeof data.output_text === "string") return data.output_text;

  if (Array.isArray(data.output)) {
    for (const item of data.output) {
      if (!isRecord(item) || !Array.isArray(item.content)) continue;
      for (const content of item.content) {
        if (isRecord(content) && typeof content.text === "string") {
          return content.text;
        }
      }
    }
  }

  return "";
}

function normalizeBattle(data: unknown, input: BattleInput): BattleSimulation {
  if (!isRecord(data)) {
    throw new Error("OpenAI returned malformed battle data.");
  }

  const stats = isRecord(data.stats) ? data.stats : {};
  const rounds = Array.isArray(data.rounds) ? data.rounds.slice(0, 1) : [];
  if (rounds.length < 1) {
    throw new Error("OpenAI returned no opening round.");
  }

  return {
    title: String(data.title || `${input.fighterA} vs ${input.fighterB}`),
    fighterADescription: cleanDescription(
      data.fighterADescription,
      input.fighterADescription,
      input.fighterA,
    ),
    fighterBDescription: cleanDescription(
      data.fighterBDescription,
      input.fighterBDescription,
      input.fighterB,
    ),
    stats: {
      fighterA: normalizeStats(stats.fighterA, input.fighterA),
      fighterB: normalizeStats(stats.fighterB, input.fighterB),
    },
    rounds: rounds.map((round, index: number) => {
      const roundRecord = isRecord(round) ? round : {};
      return {
        title: String(roundRecord.title || `Round ${index + 1}`),
        narration: String(roundRecord.narration || ""),
        edge: String(roundRecord.edge || "Even"),
      };
    }),
    winner: pickWinner(String(data.winner || ""), input.fighterA, input.fighterB),
    explanation: String(
      data.explanation || "Round one is complete. The fight is still live.",
    ),
    controversyScore: clampScore(data.controversyScore, 50),
  };
}

function normalizeIntervention(
  data: unknown,
  battle: { fighterA: string; fighterB: string; rounds: BattleRound[] },
  interference: string,
): InterventionResult {
  if (!isRecord(data) || !isRecord(data.round)) {
    throw new Error("OpenAI returned malformed round data.");
  }

  const status = data.status === "finished" ? "finished" : "ongoing";
  const winner =
    status === "finished"
      ? String(data.winner || battle.fighterA)
      : String(data.winner || "Undecided");

  return {
    round: {
      title: String(data.round.title || `Round ${battle.rounds.length + 1}`),
      narration: String(data.round.narration || ""),
      edge: String(data.round.edge || "Even"),
      interference: String(data.round.interference || interference),
    },
    winner,
    explanation: String(
      data.explanation || "The interference changes the rhythm of the fight.",
    ),
    controversyScore: clampScore(data.controversyScore, 50),
    status,
  };
}

function normalizeStats(data: unknown, name: string) {
  const stats = isRecord(data) ? data : {};
  return {
    name,
    power: clampScore(stats.power, 70),
    speed: clampScore(stats.speed, 70),
    tactics: clampScore(stats.tactics, 70),
    durability: clampScore(stats.durability, 70),
    chaos: clampScore(stats.chaos, 50),
    range: normalizeRating(stats.range, stats.tactics),
    defence: normalizeRating(stats.defence, stats.durability),
    intelligent: normalizeRating(stats.intelligent, stats.tactics),
    developmentPotential: normalizeRating(stats.developmentPotential, stats.chaos),
    edge: String(stats.edge || "Wildcard potential"),
  };
}

function cleanDescription(value: unknown, fallback: string, fighter: string) {
  const text = String(value || fallback || "").trim();
  if (
    !text ||
    text.toLowerCase().startsWith("no description provided") ||
    text.toLowerCase().includes("infer plausible")
  ) {
    return `${fighter} enters with AI-inferred strengths, weaknesses, style, and battle context.`;
  }
  return text.slice(0, 220);
}

function normalizeRating(value: unknown, fallbackScore: unknown): StandRating {
  if (typeof value === "string" && ratingValues.includes(value)) {
    return value as StandRating;
  }

  const score = clampScore(fallbackScore, 60);
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 55) return "C";
  if (score >= 35) return "D";
  return "E";
}

function pickWinner(value: string, fighterA: string, fighterB: string) {
  const lower = value.toLowerCase();
  if (lower.includes(fighterB.toLowerCase())) return fighterB;
  if (lower.includes(fighterA.toLowerCase())) return fighterA;
  return fighterA;
}

function clampScore(value: unknown, fallback: number) {
  const score = Number(value);
  if (!Number.isFinite(score)) return fallback;
  return Math.max(1, Math.min(100, Math.round(score)));
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
