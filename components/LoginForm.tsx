"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, signupAction } from "@/lib/actions";
import type { LoginFormState, SignupFormState } from "@/lib/types";

const loginInitialState: LoginFormState = {};
const signupInitialState: SignupFormState = {};

export function LoginForm() {
  const [loginState, loginFormAction] = useActionState(
    loginAction,
    loginInitialState,
  );
  const [signupState, signupFormAction] = useActionState(
    signupAction,
    signupInitialState,
  );

  return (
    <div className="mt-6 grid gap-6">
      <form action={loginFormAction} className="grid gap-4">
        <div>
          <h2 className="text-xl font-black uppercase text-white">Login</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Existing users only need their email.
          </p>
        </div>
        <label className="grid gap-2">
          <span className="form-label">Email</span>
          <input
            name="email"
            type="email"
            className="form-input"
            placeholder="you@example.com"
          />
        </label>
        {loginState.error ? (
          <p className="text-sm text-red-200">{loginState.error}</p>
        ) : null}
        <LoginSubmit />
      </form>

      <div className="h-px bg-white/10" />

      <form action={signupFormAction} className="grid gap-4">
        <div>
          <h2 className="text-xl font-black uppercase text-white">Sign up</h2>
          <p className="mt-1 text-sm text-zinc-400">
            New users choose a display name for saved battles.
          </p>
        </div>
        <label className="grid gap-2">
          <span className="form-label">Display name</span>
          <input name="name" className="form-input" placeholder="Arena Manager" />
        </label>
        <label className="grid gap-2">
          <span className="form-label">Email</span>
          <input
            name="email"
            type="email"
            className="form-input"
            placeholder="you@example.com"
          />
        </label>
        {signupState.error ? (
          <p className="text-sm text-red-200">{signupState.error}</p>
        ) : null}
        <SignupSubmit />
      </form>
    </div>
  );
}

function LoginSubmit() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="h-12 bg-cyan-300 px-4 text-sm font-black uppercase tracking-[0.2em] text-zinc-950 transition hover:bg-lime-300 disabled:cursor-wait disabled:bg-zinc-500"
    >
      {pending ? "Logging in..." : "Login"}
    </button>
  );
}

function SignupSubmit() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="h-12 border border-lime-300/60 px-4 text-sm font-black uppercase tracking-[0.2em] text-lime-100 transition hover:bg-lime-300 hover:text-zinc-950 disabled:cursor-wait disabled:border-zinc-500 disabled:text-zinc-500"
    >
      {pending ? "Signing up..." : "Sign up"}
    </button>
  );
}
