import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { getConvexClient, isConvexConfigured } from "@/lib/convex";
import { convexApi, type BattleRecord } from "@/lib/convexApi";

export default async function ExplorePage() {
  let battles: BattleRecord[] = [];
  let setupError = false;

  if (!isConvexConfigured()) {
    setupError = true;
  } else {
    try {
      battles = await getConvexClient().query(convexApi.battles.listRecent, {});
    } catch {
      setupError = true;
    }
  }

  return (
    <main className="min-h-screen">
      <Navbar showExplore={false} showGenerate={true} />
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">

        <header className="py-12">
          <p className="text-sm font-bold uppercase tracking-[0.4em] text-cyan-200">
            Recent fights
          </p>
          <h1 className="mt-4 text-5xl font-black uppercase sm:text-7xl">
            Explore
          </h1>
        </header>

        {setupError ? (
          <div className="battle-panel p-6 text-zinc-300">
            Convex is not configured yet. Run npx convex dev to enable recent
            battles.
          </div>
        ) : battles.length === 0 ? (
          <div className="battle-panel p-6 text-zinc-300">
            No battles yet. Generate the first clash.
          </div>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {battles.map((battle) => (
              <Link
                key={battle._id}
                href={`/battle/${battle._id}`}
                className="battle-panel group overflow-hidden transition hover:border-cyan-300/70"
              >
                <div className="grid h-56 grid-cols-2">
                  <PreviewImage
                    name={battle.fighterA}
                    imageUrl={battle.fighterAImageUrl}
                    side="left"
                  />
                  <PreviewImage
                    name={battle.fighterB}
                    imageUrl={battle.fighterBImageUrl}
                    side="right"
                  />
                </div>
                <div className="p-5">
                  <h2 className="line-clamp-2 text-2xl font-black uppercase text-white group-hover:text-cyan-100">
                    {battle.title}
                  </h2>
                  <p className="mt-3 text-sm text-zinc-400">
                    Winner: <span className="text-lime-200">{battle.winner}</span>
                  </p>
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function PreviewImage({
  name,
  imageUrl,
  side,
}: {
  name: string;
  imageUrl?: string | null;
  side: "left" | "right";
}) {
  return (
    <div className={`fighter-fallback ${side}`}>
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      <p className="absolute bottom-3 left-3 right-3 z-10 break-words text-sm font-black uppercase text-white">
        {name}
      </p>
    </div>
  );
}
