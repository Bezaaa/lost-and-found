import { ItemCategory, TimeOfDay } from "@prisma/client";

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  ELECTRONICS: "Electronics",
  BAGS_AND_BACKPACKS: "Bags & Backpacks",
  KEYS: "Keys",
  WALLETS_AND_CARDS: "Wallets & Cards",
  CLOTHING_AND_ACCESSORIES: "Clothing & Accessories",
  JEWELRY_AND_WATCHES: "Jewelry & Watches",
  DOCUMENTS_AND_IDS: "Documents & IDs",
  BOOKS_AND_STATIONERY: "Books & Stationery",
  OTHER: "Other",
};

export const TIME_OF_DAY_LABELS: Record<TimeOfDay, string> = {
  MORNING: "Morning",
  AFTERNOON: "Afternoon",
  EVENING: "Evening",
  NIGHT: "Night",
};
