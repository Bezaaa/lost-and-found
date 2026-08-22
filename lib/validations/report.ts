import { z } from "zod";
import { ItemCategory, ReportType, TimeOfDay } from "@prisma/client";

// Empty optional fields become `null` (not `undefined`): Prisma treats
// `undefined` in `update()` data as "leave unchanged", which would make it
// impossible to clear a previously-set optional field via the edit form.
const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

const optionalString = (max: number) =>
  z.preprocess(emptyToNull, z.string().trim().max(max).nullish());

const reportFieldsSchema = z.object({
  category: z.enum(ItemCategory, { error: "Please select a category." }),
  itemName: z
    .string()
    .trim()
    .min(2, "Item name must be at least 2 characters.")
    .max(100),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters.")
    .max(2000),
  date: z.coerce.date({ error: "Please enter a valid date." }),
  timeOfDay: z.preprocess(
    emptyToNull,
    z.enum(TimeOfDay, { error: "Please select a valid time of day." }).nullish()
  ),
  location: z.string().trim().min(2, "Location is required.").max(200),
  locationDetail: optionalString(200),
  color: optionalString(50),
  brand: optionalString(50),
  imageUrl: z.preprocess(
    emptyToNull,
    z.url({ error: "Please enter a valid image URL." }).nullish()
  ),
  contactInfo: z
    .string()
    .trim()
    .min(3, "Contact information is required.")
    .max(200),
});

const reportFieldsWithTypeSchema = reportFieldsSchema.extend({
  type: z.enum(ReportType, { error: "Please select LOST or FOUND." }),
});

export const createReportSchema = reportFieldsWithTypeSchema;

// Editing may also change LOST <-> FOUND; the matching service reconciles
// any stale PotentialMatch rows left over from the report's previous type.
export const updateReportSchema = reportFieldsWithTypeSchema;

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;

export function parseReportFormData(formData: FormData) {
  return {
    type: formData.get("type"),
    category: formData.get("category"),
    itemName: formData.get("itemName"),
    description: formData.get("description"),
    date: formData.get("date"),
    timeOfDay: formData.get("timeOfDay"),
    location: formData.get("location"),
    locationDetail: formData.get("locationDetail"),
    color: formData.get("color"),
    brand: formData.get("brand"),
    imageUrl: formData.get("imageUrl"),
    contactInfo: formData.get("contactInfo"),
  };
}
