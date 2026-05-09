export type BattleInput = {
  fighterA: string;
  fighterB: string;
  fighterADescription: string;
  fighterBDescription: string;
  environment: string;
  weapon: string;
  constraint: string;
};

const limits = {
  fighter: 60,
  description: 280,
  modifier: 90,
};

function clean(value: FormDataEntryValue | null, fallback = "") {
  return String(value ?? fallback).trim().replace(/\s+/g, " ");
}

export function parseBattleForm(formData: FormData) {
  const input: BattleInput = {
    fighterA: clean(formData.get("fighterA")),
    fighterB: clean(formData.get("fighterB")),
    fighterADescription: clean(
      formData.get("fighterADescription"),
      "No description provided. Infer plausible traits from the fighter name.",
    ),
    fighterBDescription: clean(
      formData.get("fighterBDescription"),
      "No description provided. Infer plausible traits from the fighter name.",
    ),
    environment: clean(formData.get("environment"), "AI-selected arena"),
    weapon: clean(
      formData.get("weapon"),
      "AI-selected equipment, tools, or natural abilities",
    ),
    constraint: clean(formData.get("constraint"), "Standard fair fight rules"),
  };

  const fieldErrors: Record<string, string> = {};

  if (!input.fighterA) fieldErrors.fighterA = "Enter Fighter A.";
  if (!input.fighterB) fieldErrors.fighterB = "Enter Fighter B.";
  if (input.fighterA.length > limits.fighter) {
    fieldErrors.fighterA = `Keep Fighter A under ${limits.fighter} characters.`;
  }
  if (input.fighterB.length > limits.fighter) {
    fieldErrors.fighterB = `Keep Fighter B under ${limits.fighter} characters.`;
  }
  if (input.fighterADescription.length > limits.description) {
    fieldErrors.fighterADescription = `Keep this under ${limits.description} characters.`;
  }
  if (input.fighterBDescription.length > limits.description) {
    fieldErrors.fighterBDescription = `Keep this under ${limits.description} characters.`;
  }
  for (const key of ["environment", "weapon", "constraint"] as const) {
    if (input[key].length > limits.modifier) {
      fieldErrors[key] = `Keep this under ${limits.modifier} characters.`;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false as const, fieldErrors };
  }

  return { ok: true as const, input };
}

export function parseLoginForm(formData: FormData) {
  const email = clean(formData.get("email")).toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
    return { ok: false as const, error: "Enter a valid email address." };
  }

  return { ok: true as const, input: { email } };
}

export function parseSignupForm(formData: FormData) {
  const name = clean(formData.get("name"));
  const email = clean(formData.get("email")).toLowerCase();

  if (!name || name.length > 40) {
    return { ok: false as const, error: "Enter a display name under 40 characters." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
    return { ok: false as const, error: "Enter a valid email address." };
  }

  return { ok: true as const, input: { name, email } };
}

export function parseInterferenceForm(formData: FormData) {
  const body = clean(formData.get("body"));

  if (!body) {
    return { ok: false as const, error: "Tell the arena how you want to interfere." };
  }
  if (body.length > 320) {
    return { ok: false as const, error: "Keep interference under 320 characters." };
  }

  return { ok: true as const, input: { body } };
}

export function parseCommentForm(formData: FormData) {
  const name = clean(formData.get("name"), "Anonymous");
  const body = clean(formData.get("body"));
  const fieldErrors: Record<string, string> = {};

  if (!body) fieldErrors.body = "Write a comment first.";
  if (name.length > 32) fieldErrors.name = "Keep the name under 32 characters.";
  if (body.length > 280) fieldErrors.body = "Keep comments under 280 characters.";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false as const, fieldErrors };
  }

  return { ok: true as const, input: { name, body } };
}
