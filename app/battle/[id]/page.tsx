import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentSection } from "@/components/CommentSection";
import { DeleteBattleButton } from "@/components/DeleteBattleButton";
import { FighterStage } from "@/components/FighterStage";
import { FighterStats } from "@/components/FighterStats";
import { InterferencePanel } from "@/components/InterferencePanel";
import { RoundTimeline } from "@/components/RoundTimeline";
import { ShareButton } from "@/components/ShareButton";
import { getSessionUser } from "@/lib/auth";
import { getConvexClient, isConvexConfigured } from "@/lib/convex";
import { convexApi, type BattleRecord } from "@/lib/convexApi";

export default async function BattlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();

  if (!isConvexConfigured()) {
    return <SetupMissing />;
  }

  let battle: BattleRecord | null = null;
  try {
    battle = await getConvexClient().query(convexApi.battles.get, { id });
  } catch {
    notFound();
  }

  if (!battle) {
    notFound();
  }

  const modifiers = [battle.environment, battle.weapon, battle.constraint].filter(
    (modifier) => modifier.trim().length > 0,
  );

  return (
    <main className="min-h-screen">
      <Navbar>
        <ShareButton />
        <DeleteBattleButton battleId={id} />
      </Navbar>
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:px-10">

        <header className="grid gap-4 py-8 sm:py-10">
          <p className="text-sm font-medium tracking-[0.02em] text-cyan-100/80">
            {battle.status === "finished" ? "Final simulation" : "Live simulation"}
          </p>
          <h1 className="max-w-5xl text-4xl font-semibold leading-tight text-zinc-50 sm:text-6xl">
            {battle.title}
          </h1>
          {modifiers.length > 0 ? (
            <div className="flex flex-wrap gap-2 text-sm font-medium text-zinc-300">
              {modifiers.map((modifier) => (
                <span
                  key={modifier}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5"
                >
                  {modifier}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        <FighterStage
          fighterA={battle.stats.fighterA}
          fighterB={battle.stats.fighterB}
          fighterAImageUrl={battle.fighterAImageUrl}
          fighterBImageUrl={battle.fighterBImageUrl}
        />

        <section className="grid gap-4 md:grid-cols-2">
          <div className="battle-panel p-5 sm:p-6">
            <p className="text-sm font-semibold text-cyan-200">
              {battle.fighterA}
            </p>
            <p className="mt-2 leading-7 text-zinc-300">
              {battle.fighterADescription}
            </p>
          </div>
          <div className="battle-panel p-5 sm:p-6">
            <p className="text-sm font-semibold text-lime-200">
              {battle.fighterB}
            </p>
            <p className="mt-2 leading-7 text-zinc-300">
              {battle.fighterBDescription}
            </p>
          </div>
        </section>

        <section>
          <div className="battle-panel p-5 sm:p-7">
            <p className="text-sm font-semibold text-lime-200">
              {battle.status === "finished" ? "Winner" : "Current call"}
            </p>
            <h2 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">
              {battle.winner}
            </h2>
            <p className="mt-4 text-lg leading-8 text-zinc-300">
              {battle.explanation}
            </p>
          </div>
        </section>

        <FighterStats
          fighterA={battle.stats.fighterA}
          fighterB={battle.stats.fighterB}
        />
        <section className="grid gap-4 lg:grid-cols-[1fr_0.42fr]">
          <RoundTimeline rounds={battle.rounds} />
          <InterferencePanel
            battleId={id}
            status={battle.status}
            canInterfere={Boolean(
              user?.email && battle.ownerEmail && user.email === battle.ownerEmail,
            )}
          />
        </section>
        <CommentSection battleId={id} />
      </div>
    </main>
  );
}

function SetupMissing() {
  return (
    <main className="min-h-screen px-5 py-12">
      <div className="mx-auto max-w-2xl battle-panel p-6">
        <h1 className="text-3xl font-black uppercase">Convex setup needed</h1>
        <p className="mt-4 leading-7 text-zinc-300">
          Run npx convex dev and add NEXT_PUBLIC_CONVEX_URL before opening
          shareable battle pages.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block bg-cyan-300 px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-zinc-950"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
