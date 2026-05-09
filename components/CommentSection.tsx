"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useQuery } from "convex/react";
import { addCommentAction } from "@/lib/actions";
import { convexApi, type CommentRecord } from "@/lib/convexApi";

export function CommentSection({ battleId }: { battleId: string }) {
  const configured = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
  const comments = useQuery(
    convexApi.comments.listForBattle,
    configured ? { battleId } : "skip",
  );
  const action = addCommentAction.bind(null, battleId);
  const [state, formAction] = useActionState(action, {});

  if (!configured) {
    return (
      <section className="battle-panel p-5 text-sm text-zinc-300">
        Comments need Convex. Run npx convex dev and add NEXT_PUBLIC_CONVEX_URL.
      </section>
    );
  }

  return (
    <section className="battle-panel p-5 sm:p-6">
      <h2 className="text-2xl font-semibold text-white">Crowd reactions</h2>
      <form action={formAction} className="mt-5 grid gap-3">
        <input
          name="name"
          placeholder="Display name"
          className="form-input"
          maxLength={32}
        />
        <textarea
          name="body"
          placeholder="Call the fight..."
          className="form-input min-h-24 resize-none"
          maxLength={280}
        />
        {state.error ? <p className="text-sm text-red-200">{state.error}</p> : null}
        {state.success ? (
          <p className="text-sm text-lime-200">Comment posted.</p>
        ) : null}
        <CommentSubmit />
      </form>

      <div className="mt-6 grid gap-3">
        {comments === undefined ? (
          <p className="text-sm text-zinc-400">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-zinc-400">No reactions yet.</p>
        ) : (
          (comments as CommentRecord[]).map((comment) => (
            <article
              key={comment._id}
              className="border border-white/10 bg-white/[0.04] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold text-white">{comment.name}</h3>
                <time className="text-xs text-zinc-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </time>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-300">{comment.body}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function CommentSubmit() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 rounded-md bg-zinc-100 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-lime-200 disabled:cursor-wait disabled:bg-zinc-500"
    >
      {pending ? "Posting..." : "Post comment"}
    </button>
  );
}
