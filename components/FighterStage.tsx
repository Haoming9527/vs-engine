import type { FighterStat } from "@/lib/types";

export function FighterStage({
  fighterA,
  fighterB,
  fighterAImageUrl,
  fighterBImageUrl,
}: {
  fighterA: FighterStat;
  fighterB: FighterStat;
  fighterAImageUrl?: string | null;
  fighterBImageUrl?: string | null;
}) {
  return (
    <section className="battle-panel overflow-hidden">
      <div className="grid min-h-[32rem] grid-cols-1 md:grid-cols-[1fr_auto_1fr]">
        <FighterPanel fighter={fighterA} imageUrl={fighterAImageUrl} side="left" />
        <div className="flex items-center justify-center border-y border-white/10 bg-black/20 p-5 md:border-x md:border-y-0">
          <div className="vs-mark">VS</div>
        </div>
        <FighterPanel fighter={fighterB} imageUrl={fighterBImageUrl} side="right" />
      </div>
    </section>
  );
}

function FighterPanel({
  fighter,
  imageUrl,
  side,
}: {
  fighter: FighterStat;
  imageUrl?: string | null;
  side: "left" | "right";
}) {
  return (
    <div className={`fighter-fallback ${side}`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={fighter.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
      <div className="relative z-10 flex min-h-[32rem] flex-col justify-end p-5 sm:p-8">
        <p className="text-xs font-medium tracking-[0.08em] text-cyan-100/70">
          {side === "left" ? "Fighter A" : "Fighter B"}
        </p>
        <h2 className="mt-2 break-words text-4xl font-bold text-white sm:text-5xl">
          {fighter.name}
        </h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-zinc-200">{fighter.edge}</p>
      </div>
    </div>
  );
}
