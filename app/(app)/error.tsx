"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-rose-500/15 text-rose-300">
        <AlertTriangle className="size-6" />
      </span>
      <p className="text-base font-semibold text-foreground">Something went wrong</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        We couldn&apos;t load this page. This is likely a temporary issue - please try again.
      </p>
      <div className="mt-2 flex gap-3">
        <Button onClick={reset} variant="default">
          Try again
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
