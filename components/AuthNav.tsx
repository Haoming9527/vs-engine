import Link from "next/link";
import { logoutAction } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";

export async function AuthNav() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-md border border-white/10 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/25 hover:text-white"
      >
        Login
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/account"
        className="rounded-md border border-white/10 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/25 hover:text-white"
      >
        {user.name}
      </Link>
      <form action={logoutAction}>
        <button
          type="submit"
          className="rounded-md border border-white/10 px-3 py-2 text-sm font-medium text-zinc-400 transition hover:border-red-200/50 hover:text-red-100"
        >
          Logout
        </button>
      </form>
    </div>
  );
}
