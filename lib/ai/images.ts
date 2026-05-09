import type { BattleInput } from "@/lib/validation";

export type GeneratedImage = {
  bytes: Uint8Array;
  contentType: string;
};

export async function generateFighterImages(input: BattleInput) {
  const [fighterA, fighterB] = await Promise.allSettled([
    generateFighterImage(input, "A"),
    generateFighterImage(input, "B"),
  ]);

  return {
    fighterA: fighterA.status === "fulfilled" ? fighterA.value : null,
    fighterB: fighterB.status === "fulfilled" ? fighterB.value : null,
  };
}

async function generateFighterImage(
  input: BattleInput,
  side: "A" | "B",
): Promise<GeneratedImage> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI is not configured.");
  }

  const fighter = side === "A" ? input.fighterA : input.fighterB;
  const opponent = side === "A" ? input.fighterB : input.fighterA;
  const direction = side === "A" ? "facing right" : "facing left";
  const prompt = [
    `Cinematic battle card portrait of ${fighter}, ${direction}.`,
    `Character dossier: ${
      side === "A" ? input.fighterADescription : input.fighterBDescription
    }.`,
    `Opponent context: ${opponent}.`,
    `Arena: ${input.environment}.`,
    `Modifier: ${input.weapon}. Constraint: ${input.constraint}.`,
    "Dramatic lighting, the image need to be realistic, no text, no logos, high-detail poster art, energetic but non-graphic.",
  ].join(" ");

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1",
      prompt,
      size: "1024x1024",
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();
  const b64 = data.data?.[0]?.b64_json;
  if (typeof b64 !== "string") {
    throw new Error("OpenAI image generation returned no image data.");
  }

  return {
    bytes: Buffer.from(b64, "base64"),
    contentType: "image/png",
  };
}
