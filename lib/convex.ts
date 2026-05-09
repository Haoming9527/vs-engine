import { ConvexHttpClient } from "convex/browser";

export function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error(
      "Convex is not configured. Run npx convex dev and add NEXT_PUBLIC_CONVEX_URL.",
    );
  }

  return new ConvexHttpClient(url);
}

export function isConvexConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
}
