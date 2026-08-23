import Link from "next/link";
import { SearchX } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <SearchX className="size-6" />
      </span>
      <p className="text-base font-semibold text-foreground">We couldn&apos;t find that</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        This report or page may have been removed, or the link might be incorrect.
      </p>
      <Link href="/" className={cn(buttonVariants({ variant: "default" }), "mt-2")}>
        Go to dashboard
      </Link>
    </div>
  );
}
