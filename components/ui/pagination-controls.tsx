import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function PaginationControls({
  basePath,
  params,
  currentPage,
  totalPages,
}: {
  basePath: string;
  /** Existing filter params to preserve (page is set/overwritten per link). */
  params: URLSearchParams;
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  function pageHref(page: number) {
    const next = new URLSearchParams(params);
    next.set("page", String(page));
    return `${basePath}?${next.toString()}`;
  }

  return (
    <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
      {currentPage > 1 ? (
        <Link
          href={pageHref(currentPage - 1)}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Link>
      ) : (
        <span
          aria-disabled
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "cursor-not-allowed opacity-40")}
        >
          <ChevronLeft className="size-4" />
          Previous
        </span>
      )}

      <span className="text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Link
          href={pageHref(currentPage + 1)}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Next
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span
          aria-disabled
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "cursor-not-allowed opacity-40")}
        >
          Next
          <ChevronRight className="size-4" />
        </span>
      )}
    </div>
  );
}
