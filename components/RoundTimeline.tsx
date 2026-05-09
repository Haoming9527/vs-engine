import type { BattleRound } from "@/lib/types";

export function RoundTimeline({ rounds }: { rounds: BattleRound[] }) {
  return (
    <section className="battle-panel p-5 sm:p-6">
      <h2 className="text-2xl font-semibold text-white">Round by round</h2>
      <div className="mt-6 grid gap-4">
        {rounds.map((round, index) => (
          <article
            key={`${round.title}-${index}`}
            className="rounded-md border border-white/10 bg-white/[0.035] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-cyan-100">
                {index + 1}. {round.title}
              </h3>
              <span className="rounded-full bg-lime-200 px-3 py-1 text-xs font-semibold text-zinc-950">
                Edge: {round.edge}
              </span>
            </div>
            <p className="mt-3 leading-7 text-zinc-300">{round.narration}</p>
            {round.interference ? (
              <p className="mt-3 border-l-2 border-lime-300 pl-3 text-sm leading-6 text-lime-100/85">
                Interference: {round.interference}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
