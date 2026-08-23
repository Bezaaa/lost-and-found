import {
  BookOpen,
  Gem,
  KeyRound,
  Laptop,
  Package,
  Shirt,
  Backpack as BackpackIcon,
  IdCard,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import type { ItemCategory } from "@prisma/client";

export const CATEGORY_ICONS: Record<ItemCategory, LucideIcon> = {
  ELECTRONICS: Laptop,
  BAGS_AND_BACKPACKS: BackpackIcon,
  KEYS: KeyRound,
  WALLETS_AND_CARDS: WalletCards,
  CLOTHING_AND_ACCESSORIES: Shirt,
  JEWELRY_AND_WATCHES: Gem,
  DOCUMENTS_AND_IDS: IdCard,
  BOOKS_AND_STATIONERY: BookOpen,
  OTHER: Package,
};
