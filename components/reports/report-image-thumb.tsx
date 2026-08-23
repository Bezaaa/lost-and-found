import type { ItemCategory } from "@prisma/client";

import { CATEGORY_ICONS } from "@/lib/reports/category-icons";

export function ReportImageThumb({
  imageUrl,
  itemName,
  category,
  className = "size-24",
}: {
  imageUrl: string | null;
  itemName: string;
  category: ItemCategory;
  className?: string;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={itemName}
        className={`${className} shrink-0 rounded-md border border-border object-cover`}
      />
    );
  }

  const Icon = CATEGORY_ICONS[category];
  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center rounded-md border border-border bg-stone-800`}
    >
      <Icon className="size-8 text-stone-500" aria-hidden />
    </div>
  );
}
