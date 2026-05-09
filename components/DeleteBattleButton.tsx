"use client";

import { deleteBattleAction } from "@/lib/actions";

export function DeleteBattleButton({ battleId }: { battleId: string }) {
  return (
    <form
      action={deleteBattleAction.bind(null, battleId)}
      onSubmit={(event) => {
        if (!window.confirm("Delete this battle permanently?")) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-md border border-red-200/25 px-3 py-2 text-sm font-medium text-red-100 transition hover:bg-red-300 hover:text-zinc-950"
      >
        Delete
      </button>
    </form>
  );
}
