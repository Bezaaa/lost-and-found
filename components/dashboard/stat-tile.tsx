import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  icon: Icon,
  accentClassName = "bg-accent text-accent-foreground",
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  accentClassName?: string;
}) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-lg", accentClassName)}>
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}
