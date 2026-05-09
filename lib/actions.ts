"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { convexApi } from "@/lib/convexApi";
import { getConvexClient } from "@/lib/convex";
import type {
  BattleFormState,
  CommentFormState,
  InterferenceFormState,
  LoginFormState,
  SignupFormState,
} from "@/lib/types";
import {
  generateBattleSimulation,
  generateInterventionRound,
} from "@/lib/ai/battle";
import { generateFighterImages, type GeneratedImage } from "@/lib/ai/images";
import {
  parseBattleForm,
  parseCommentForm,
  parseInterferenceForm,
  parseLoginForm,
  parseSignupForm,
} from "@/lib/validation";
import { clearSessionUser, getSessionUser, setSessionUser } from "@/lib/auth";
import { findUserByEmail, upsertUser } from "@/lib/neon";

export async function createBattleAction(
  _prevState: BattleFormState,
  formData: FormData,
): Promise<BattleFormState> {
  const parsed = parseBattleForm(formData);
  if (!parsed.ok) {
    return { fieldErrors: parsed.fieldErrors };
  }

  try {
    const convex = getConvexClient();
    const user = await getSessionUser();
    const simulation = await generateBattleSimulation(parsed.input);
    const images = await generateFighterImages(parsed.input);

    const [fighterAImageStorageId, fighterBImageStorageId] = await Promise.all([
      uploadImage(convex, images.fighterA),
      uploadImage(convex, images.fighterB),
    ]);

    const battleId = await convex.mutation(convexApi.battles.create, {
      ...parsed.input,
      ...simulation,
      fighterAImageStorageId: fighterAImageStorageId ?? undefined,
      fighterBImageStorageId: fighterBImageStorageId ?? undefined,
      imageProvider:
        fighterAImageStorageId || fighterBImageStorageId ? "openai" : "fallback",
      status: "ongoing",
      ownerEmail: user?.email,
      ownerName: user?.name,
    });

    revalidatePath("/");
    revalidatePath("/explore");
    redirect(`/battle/${battleId}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not generate this battle. Check your setup and try again.",
    };
  }
}

export async function interfereBattleAction(
  battleId: string,
  _prevState: InterferenceFormState,
  formData: FormData,
): Promise<InterferenceFormState> {
  const parsed = parseInterferenceForm(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  try {
    const convex = getConvexClient();
    const battle = await convex.query(convexApi.battles.get, { id: battleId });
    if (!battle) {
      return { error: "Battle not found." };
    }
    if (battle.status === "finished") {
      return { error: "This battle is already finished." };
    }

    const user = await getSessionUser();
    if (!user?.email || battle.ownerEmail !== user.email) {
      return { error: "Only the battle creator can interfere." };
    }

    const result = await generateInterventionRound({
      battle,
      interference: parsed.input.body,
    });

    await convex.mutation(convexApi.battles.appendRound, {
      id: battleId,
      ...result,
      interference: parsed.input.body,
      authorName: user?.name ?? "Anonymous strategist",
    });

    revalidatePath(`/battle/${battleId}`);
    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not interfere with the battle.",
    };
  }
}

export async function addCommentAction(
  battleId: string,
  _prevState: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const parsed = parseCommentForm(formData);
  if (!parsed.ok) {
    return { error: Object.values(parsed.fieldErrors)[0] };
  }

  try {
    const convex = getConvexClient();
    await convex.mutation(convexApi.comments.add, {
      battleId,
      ...parsed.input,
    });
    revalidatePath(`/battle/${battleId}`);
    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not post the comment right now.",
    };
  }
}

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const parsed = parseLoginForm(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  try {
    const user = await findUserByEmail(parsed.input.email);
    if (!user) {
      return { error: "No account found for this email. Sign up first." };
    }

    await setSessionUser(user);
    revalidatePath("/");
    revalidatePath("/account");
    redirect("/account");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not log in with Neon right now.",
    };
  }
}

export async function signupAction(
  _prevState: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  const parsed = parseSignupForm(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  try {
    const user = await upsertUser(parsed.input.email, parsed.input.name);
    await setSessionUser(user);
    revalidatePath("/");
    revalidatePath("/account");
    redirect("/account");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not sign up with Neon right now.",
    };
  }
}

export async function logoutAction() {
  await clearSessionUser();
  revalidatePath("/");
  redirect("/");
}

export async function deleteBattleAction(battleId: string) {
  const convex = getConvexClient();
  const user = await getSessionUser();
  const battle = await convex.query(convexApi.battles.get, { id: battleId });

  if (!battle) {
    redirect("/explore");
  }

  if (battle.ownerEmail && battle.ownerEmail !== user?.email) {
    throw new Error("Only the battle owner can delete this battle.");
  }

  await convex.mutation(convexApi.battles.deleteById, {
    id: battleId,
    requesterEmail: user?.email,
  });

  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath("/account");
  redirect(user ? "/account" : "/explore");
}

async function uploadImage(
  convex: ReturnType<typeof getConvexClient>,
  image: GeneratedImage | null,
) {
  if (!image) {
    return null;
  }

  const uploadUrl = await convex.mutation(convexApi.battles.generateUploadUrl, {});
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": image.contentType },
    body: new Blob([new Uint8Array(image.bytes)], { type: image.contentType }),
  });

  if (!response.ok) {
    throw new Error("Could not upload generated image to Convex storage.");
  }

  const { storageId } = await response.json();
  return storageId as string;
}

function isRedirectError(error: unknown) {
  return (
    error instanceof Error &&
    "digest" in error &&
    String((error as Error & { digest?: string }).digest).startsWith("NEXT_REDIRECT")
  );
}
