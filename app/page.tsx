import { logoutAction } from "@/lib/actions/auth-actions";
import { requireUser } from "@/lib/session";

export default async function Home() {
  const user = await requireUser();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">
        Signed in as {user.name ?? user.email}
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">{user.email}</p>
      <form action={logoutAction}>
        <button
          type="submit"
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          Log out
        </button>
      </form>
    </div>
  );
}
