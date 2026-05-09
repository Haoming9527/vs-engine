import { fal } from "@fal-ai/client";
import type { BattleInput } from "@/lib/validation";

export type GeneratedImage = {
  bytes: Uint8Array;
  contentType: string;
};

export async function generateFighterImages(input: BattleInput) {
  let fighterA = null;
  try {
    fighterA = await generateFighterImage(input, "A");
  } catch (error) {
    console.error("Failed to generate Fighter A image:", error);
    fighterA = await generateFallbackImage(input.fighterA);
  }

  let fighterB = null;
  try {
    fighterB = await generateFighterImage(input, "B");
  } catch (error) {
    console.error("Failed to generate Fighter B image:", error);
    fighterB = await generateFallbackImage(input.fighterB);
  }

  return {
    fighterA,
    fighterB,
  };
}

async function generateFallbackImage(name: string): Promise<GeneratedImage> {
  const url = `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(name)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch fallback image");
  }
  const arrayBuffer = await response.arrayBuffer();
  return {
    bytes: new Uint8Array(arrayBuffer),
    contentType: "image/svg+xml",
  };
}

async function generateFighterImage(
  input: BattleInput,
  side: "A" | "B",
): Promise<GeneratedImage> {
  const apiKey = process.env.FAL_API_KEY || process.env.FAL_KEY;
  if (!apiKey) {
    throw new Error("FAL API key is not configured.");
  }
  
  fal.config({ credentials: apiKey });

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
    "Ultra-realistic, photorealistic, 8k resolution, cinematic lighting, hyper-detailed photography. It MUST look like a real-life photograph or high-end live-action movie still. DO NOT make it look like a cartoon, painting, illustration, or toy.",
    "CRITICAL: Keep it completely family-friendly and safe for work. NO violence, NO blood, NO gore. Show the character posing dynamically but peacefully to pass strict safety filters.",
  ].join(" ");

  const { data } = await fal.subscribe("fal-ai/flux/schnell", {
    input: {
      prompt,
      image_size: "square_hd",
    },
  });

  const imageUrl = (data as any).images?.[0]?.url;
  if (!imageUrl) {
    throw new Error("fal image generation returned no image data.");
  }

  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error("Failed to fetch generated image from fal URL.");
  }

  const arrayBuffer = await imageResponse.arrayBuffer();

  return {
    bytes: new Uint8Array(arrayBuffer),
    contentType: "image/jpeg",
  };
}
