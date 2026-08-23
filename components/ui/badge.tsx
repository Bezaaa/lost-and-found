import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        // Report type indicators.
        lost: "border-transparent bg-rose-500/15 text-rose-300",
        found: "border-transparent bg-green-500/15 text-green-300",
        // Report status.
        resolved: "border-transparent bg-stone-500/15 text-stone-300",
        // Match confidence tiers. "strong" reuses the brand accent (rather
        // than green) so it never reads as a FOUND indicator when the two
        // appear together on a match card.
        strong: "border-transparent bg-accent text-accent-foreground",
        possible: "border-transparent bg-amber-500/15 text-amber-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
