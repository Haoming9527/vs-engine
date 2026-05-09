"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useQuery } from "convex/react";
import { interfereBattleAction } from "@/lib/actions";
import { convexApi, type InterventionRecord } from "@/lib/convexApi";
import type { InterferenceFormState } from "@/lib/types";

const initialState: InterferenceFormState = {};

export function InterferencePanel({
  battleId,
  status,
  canInterfere,
}: {
  battleId: string;
  status: "ongoing" | "finished";
  canInterfere: boolean;
}) {
  const configured = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
  const interventions = useQuery(
    convexApi.interventions.listForBattle,
    configured ? { battleId } : "skip",
  );
  const action = interfereBattleAction.bind(null, battleId);
  const [state, formAction] = useActionState(action, initialState);

  return (
    <aside className="battle-panel p-5 sm:p-6">
      <p className="text-sm font-medium text-cyan-100/75">
        Interference feed
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-white">
        Change the fight
      </h2>
      <p className="mt-3 text-sm leading-6 text-zinc-400">
        The battle creator can optionally drop a tactic, event, item, weather
        twist, crowd chant, or wild rule. The AI adds one new round at a time.
      </p>

      {canInterfere ? (
        <form action={formAction} className="mt-5 grid gap-3">
          <textarea
            name="body"
            disabled={status === "finished"}
            placeholder={
              status === "finished"
                ? "The fight is over."
                : "Optional: add a twist to generate the next round..."
            }
            className="form-input min-h-32 resize-none"
            maxLength={320}
          />
          {state.error ? <p className="text-sm text-red-200">{state.error}</p> : null}
          {state.success ? (
            <p className="text-sm text-lime-200">Interference accepted.</p>
          ) : null}
          <InterferenceSubmit disabled={status === "finished"} />
        </form>
      ) : (
        <div className="mt-5 rounded-md border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-zinc-400">
          Only the logged-in creator of this battle can interfere. Everyone else
          can watch and comment.
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {interventions === undefined ? (
          <p className="text-sm text-zinc-500">Loading interference...</p>
        ) : interventions.length === 0 ? (
          <p className="text-sm text-zinc-500">No one has interfered yet.</p>
        ) : (
          (interventions as InterventionRecord[]).map((item) => (
            <article
              key={item._id}
              className="rounded-md border border-white/10 bg-white/[0.035] p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-white">{item.authorName}</span>
                <span className="text-xs font-medium text-zinc-500">
                  {item.roundTitle}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-300">{item.body}</p>
            </article>
          ))
        )}
      </div>
    </aside>
  );
}

function InterferenceSubmit({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="h-12 rounded-md bg-lime-200 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:bg-zinc-500"
    >
      {pending ? "Generating next round..." : "Interfere"}
    </button>
  );
}
