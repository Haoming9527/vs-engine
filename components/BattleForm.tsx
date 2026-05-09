"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createBattleAction } from "@/lib/actions";
import type { BattleFormState } from "@/lib/types";

const presets = [
  ["Tiger", "Lion"],
  ["Batman", "Superman"],
  ["Napoleon", "Caesar"],
  ["Saitama", "Goku"],
  ["Shark", "Crocodile"],
  ["Student", "Procrastination"],
] as const;

const initialState: BattleFormState = {};

export function BattleForm() {
  const [state, formAction] = useActionState(createBattleAction, initialState);
  const [fighters, setFighters] = useState({ fighterA: "", fighterB: "" });

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <form action={formAction} className="battle-panel p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Fighter A *"
            name="fighterA"
            placeholder="Tiger"
            value={fighters.fighterA}
            error={state.fieldErrors?.fighterA}
            onChange={(value) =>
              setFighters((current) => ({ ...current, fighterA: value }))
            }
          />
          <Field
            label="Fighter B *"
            name="fighterB"
            placeholder="Lion"
            value={fighters.fighterB}
            error={state.fieldErrors?.fighterB}
            onChange={(value) =>
              setFighters((current) => ({ ...current, fighterB: value }))
            }
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="form-label">Fighter A Description</span>
            <textarea
              name="fighterADescription"
              placeholder="Strengths, weaknesses, version, backstory..."
              className="form-input min-h-28 resize-none"
              maxLength={280}
            />
            {state.fieldErrors?.fighterADescription ? (
              <span className="text-xs text-red-200">
                {state.fieldErrors.fighterADescription}
              </span>
            ) : null}
          </label>
          <label className="grid gap-2">
            <span className="form-label">Fighter B Description</span>
            <textarea
              name="fighterBDescription"
              placeholder="Power level, equipment, personality, constraints..."
              className="form-input min-h-28 resize-none"
              maxLength={280}
            />
            {state.fieldErrors?.fighterBDescription ? (
              <span className="text-xs text-red-200">
                {state.fieldErrors.fighterBDescription}
              </span>
            ) : null}
          </label>
        </div>

        <div className="mt-5 grid gap-4">
          <label className="grid gap-2">
            <span className="form-label">Environment</span>
            <input
              name="environment"
              placeholder="Leave blank and AI will choose the arena"
              className="form-input"
            />
          </label>
          <label className="grid gap-2">
            <span className="form-label">Weapon or Tool</span>
            <input
              name="weapon"
              placeholder="Leave blank and AI will infer equipment"
              className="form-input"
            />
          </label>
          <label className="grid gap-2">
            <span className="form-label">Rule or Constraint</span>
            <input
              name="constraint"
              placeholder="Leave blank for standard fair fight rules"
              className="form-input"
            />
          </label>
        </div>

        {state.error ? (
          <div className="mt-5 border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-100">
            {state.error}
          </div>
        ) : null}

        <SubmitButton />
      </form>

      <aside className="battle-panel overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_1fr] items-stretch">
          <FighterPreview name={fighters.fighterA || "Fighter A"} side="left" />
          <div className="flex min-h-80 items-center justify-center border-x border-white/10 bg-white/[0.03] px-4">
            <div className="vs-mark">VS</div>
          </div>
          <FighterPreview name={fighters.fighterB || "Fighter B"} side="right" />
        </div>
        <div className="border-t border-white/10 p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">
            Presets
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {presets.map(([fighterA, fighterB]) => (
              <button
                key={`${fighterA}-${fighterB}`}
                type="button"
                onClick={() => setFighters({ fighterA, fighterB })}
                className="border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-zinc-100 transition hover:border-cyan-300/60 hover:bg-cyan-300/10"
              >
                {fighterA} vs {fighterB}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
  value,
  error,
  onChange,
}: {
  label: string;
  name: string;
  placeholder: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="form-label">{label}</span>
      <input
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="form-input text-lg font-semibold"
      />
      {error ? <span className="text-xs text-red-200">{error}</span> : null}
    </label>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <div className="mt-6">
      {pending ? (
        <div className="mb-3 border border-white/10 bg-black/30 p-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">
            <span>Generating first round</span>
            <span>Live</span>
          </div>
          <div className="mt-3 h-2 bg-white/10">
            <div className="loading-bar h-full bg-cyan-300" />
          </div>
          <p className="mt-3 text-xs text-zinc-400">
            Writing opening exchange, rendering fighters, saving the arena.
          </p>
        </div>
      ) : null}
        <button
          type="submit"
          disabled={pending}
        className="flex h-14 w-full items-center justify-center rounded-md bg-zinc-100 px-5 text-sm font-semibold text-zinc-950 transition hover:bg-stone-200 disabled:cursor-wait disabled:bg-zinc-500"
      >
        {pending ? "Generating battle..." : "Generate First Round"}
      </button>
    </div>
  );
}

function FighterPreview({ name, side }: { name: string; side: "left" | "right" }) {
  return (
    <div className={`fighter-fallback min-h-80 ${side === "left" ? "left" : "right"}`}>
      <div className="relative z-10 flex h-full flex-col justify-between p-5">
        <span className="text-xs font-medium tracking-[0.08em] text-white/50">
          {side === "left" ? "Challenger" : "Defender"}
        </span>
        <div>
          <div className="mx-auto mb-5 h-28 w-28 border border-white/20 bg-black/30 shadow-[0_0_60px_rgba(34,211,238,0.25)]" />
          <h2 className="break-words text-center text-2xl font-bold text-white">
            {name}
          </h2>
        </div>
        <span className="text-center text-xs font-medium tracking-[0.08em] text-white/50">
          Awaiting render
        </span>
      </div>
    </div>
  );
}
