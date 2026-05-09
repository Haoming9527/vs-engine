import { Navbar } from "@/components/Navbar";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen">
      <Navbar showGenerate={true} showExplore={true} />
      <div className="mx-auto max-w-xl px-5 py-12">
        <section className="battle-panel mt-10 p-6">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-cyan-200">
            Neon login
          </p>
          <h1 className="mt-4 text-4xl font-black uppercase">Claim your arena</h1>
          <p className="mt-3 leading-7 text-zinc-300">
            Log in with email if you already have an account. Sign up once with a
            display name to save battles to your profile.
          </p>
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
