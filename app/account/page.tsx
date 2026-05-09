import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { redirect } from "next/navigation";
import { convexApi, type BattleRecord } from "@/lib/convexApi";
import { getConvexClient, isConvexConfigured } from "@/lib/convex";
import { getSessionUser } from "@/lib/auth";
import { DeleteBattleButton } from "@/components/DeleteBattleButton";

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  let battles: BattleRecord[] = [];
  let setupError = false;

  if (!isConvexConfigured()) {
    setupError = true;
  } else {
    try {
      battles = await getConvexClient().query(convexApi.battles.listForOwner, {
        ownerEmail: user.email,
      });
    } catch {
      setupError = true;
    }
  }

  return (
    <main className="min-h-screen">
      <Navbar showGenerate={true} showExplore={true} />
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-12">
        <header className="py-10">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-cyan-200">
            Signed in as {user.email}
          </p>
          <h1 className="mt-4 text-5xl font-black uppercase">Your battles</h1>
        </header>

        {setupError ? (
          <div className="battle-panel p-6 text-zinc-300">
            Convex needs to be pushed before account battle history can load.
          </div>
        ) : battles.length === 0 ? (
          <div className="battle-panel p-6 text-zinc-300">
            No battles saved yet. Generate one while logged in.
          </div>
        ) : (
          <section className="grid gap-4 md:grid-cols-2">
            {battles.map((battle) => (
              <article key={battle._id} className="battle-panel p-5">
                <Link href={`/battle/${battle._id}`} className="block">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-500">
                    {battle.status}
                  </p>
                  <h2 className="mt-2 text-2xl font-black uppercase text-white">
                    {battle.title}
                  </h2>
                  <p className="mt-3 text-sm text-zinc-400">
                    Current call:{" "}
                    <span className="text-lime-200">{battle.winner}</span>
                  </p>
                </Link>
                <div className="mt-4">
                  <DeleteBattleButton battleId={battle._id} />
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
