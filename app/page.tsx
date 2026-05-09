import { Navbar } from "@/components/Navbar";
import { BattleForm } from "@/components/BattleForm";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="relative px-5 py-12 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(214,177,120,0.10),transparent_38%,rgba(107,155,143,0.09))]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid min-h-[calc(100vh-12rem)] content-center gap-8 py-12">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold tracking-[0.08em] text-cyan-200">
                AI battle simulator
              </p>
              <h1 className="mt-4 max-w-5xl text-6xl font-black leading-none text-white sm:text-8xl lg:text-9xl">
                Who would win?
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
                Simulate any matchup with AI: animals, heroes, historical figures,
                fictional characters, or anything else.
              </p>
            </div>
            <BattleForm />
          </div>
        </div>
      </section>
    </main>
  );
}
