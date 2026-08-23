"use client";

import { useActionState, useState } from "react";
import { PackageSearch, PackageX } from "lucide-react";
import { ItemCategory, ReportType, TimeOfDay } from "@prisma/client";

import type { ReportFormState } from "@/lib/actions/report-actions";
import { CATEGORY_LABELS, TIME_OF_DAY_LABELS } from "@/lib/reports/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type ReportFormDefaults = Partial<{
  type: ReportType;
  category: ItemCategory;
  itemName: string;
  description: string;
  date: string;
  timeOfDay: TimeOfDay | null;
  location: string;
  locationDetail: string | null;
  color: string | null;
  brand: string | null;
  imageUrl: string | null;
  contactInfo: string;
}>;

type FormValues = {
  type: ReportType;
  category: ItemCategory | "";
  itemName: string;
  description: string;
  date: string;
  timeOfDay: TimeOfDay | "";
  location: string;
  locationDetail: string;
  color: string;
  brand: string;
  imageUrl: string;
  contactInfo: string;
};

function toFormValues(defaults?: ReportFormDefaults): FormValues {
  return {
    type: defaults?.type ?? ReportType.LOST,
    category: defaults?.category ?? "",
    itemName: defaults?.itemName ?? "",
    description: defaults?.description ?? "",
    date: defaults?.date ?? "",
    timeOfDay: defaults?.timeOfDay ?? "",
    location: defaults?.location ?? "",
    locationDetail: defaults?.locationDetail ?? "",
    color: defaults?.color ?? "",
    brand: defaults?.brand ?? "",
    imageUrl: defaults?.imageUrl ?? "",
    contactInfo: defaults?.contactInfo ?? "",
  };
}

function FormSection({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-4", step > 1 && "border-t border-border pt-6")}>
      <div className="flex items-start gap-3">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
          {step}
        </span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex flex-col gap-4 pl-9">{children}</div>
    </div>
  );
}

export function ReportForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (state: ReportFormState, formData: FormData) => Promise<ReportFormState>;
  defaults?: ReportFormDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  // Controlled fields: React 19 resets uncontrolled <form action> fields after
  // every submission, success or failure. Without this, a validation error
  // would wipe out everything the user had just typed.
  const [values, setValues] = useState<FormValues>(() => toFormValues(defaults));

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <fieldset>
        <legend className="sr-only">Report type</legend>
        <div className="grid grid-cols-2 gap-3">
          <label
            className={cn(
              "flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 py-3 text-sm font-semibold transition-colors",
              values.type === ReportType.LOST
                ? "border-rose-500 bg-rose-500/10 text-rose-300"
                : "border-border bg-card text-muted-foreground hover:bg-stone-800"
            )}
          >
            <input
              type="radio"
              name="type"
              value={ReportType.LOST}
              checked={values.type === ReportType.LOST}
              onChange={() => set("type", ReportType.LOST)}
              required
              className="sr-only"
            />
            <PackageX className="size-4" />I lost something
          </label>
          <label
            className={cn(
              "flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 py-3 text-sm font-semibold transition-colors",
              values.type === ReportType.FOUND
                ? "border-green-500 bg-green-500/10 text-green-300"
                : "border-border bg-card text-muted-foreground hover:bg-stone-800"
            )}
          >
            <input
              type="radio"
              name="type"
              value={ReportType.FOUND}
              checked={values.type === ReportType.FOUND}
              onChange={() => set("type", ReportType.FOUND)}
              className="sr-only"
            />
            <PackageSearch className="size-4" />I found something
          </label>
        </div>
      </fieldset>

      <FormSection step={1} title="What is the item?" description="Help others recognize it at a glance.">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">Category</Label>
          <Select
            id="category"
            name="category"
            value={values.category}
            onChange={(e) => set("category", e.target.value as ItemCategory)}
            required
          >
            <option value="" disabled>
              Select a category
            </option>
            {Object.values(ItemCategory).map((value) => (
              <option key={value} value={value}>
                {CATEGORY_LABELS[value]}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="itemName">Item name</Label>
          <Input
            id="itemName"
            name="itemName"
            type="text"
            placeholder="e.g. Blue Jansport backpack"
            value={values.itemName}
            onChange={(e) => set("itemName", e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Any details that would help someone recognize this item..."
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            required
          />
        </div>
      </FormSection>

      <FormSection step={2} title="Where and when?" description="Approximate details are fine.">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={values.date}
              onChange={(e) => set("date", e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="timeOfDay">
              Approximate time <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Select
              id="timeOfDay"
              name="timeOfDay"
              value={values.timeOfDay}
              onChange={(e) => set("timeOfDay", e.target.value as TimeOfDay | "")}
            >
              <option value="">Unspecified</option>
              {Object.values(TimeOfDay).map((value) => (
                <option key={value} value={value}>
                  {TIME_OF_DAY_LABELS[value]}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            type="text"
            placeholder="e.g. Science Building"
            value={values.location}
            onChange={(e) => set("location", e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="locationDetail">
            Additional location detail <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="locationDetail"
            name="locationDetail"
            type="text"
            placeholder="e.g. Near room 204"
            value={values.locationDetail}
            onChange={(e) => set("locationDetail", e.target.value)}
          />
        </div>
      </FormSection>

      <FormSection step={3} title="Additional details" description="Optional, but these make matching more accurate.">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="color">
              Color <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="color"
              name="color"
              type="text"
              value={values.color}
              onChange={(e) => set("color", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="brand">
              Brand <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="brand"
              name="brand"
              type="text"
              value={values.brand}
              onChange={(e) => set("brand", e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="imageUrl">
            Image URL <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            type="url"
            placeholder="https://..."
            value={values.imageUrl}
            onChange={(e) => set("imageUrl", e.target.value)}
          />
        </div>
      </FormSection>

      <FormSection step={4} title="Contact" description="How should someone reach you about this?">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contactInfo">Contact information</Label>
          <Input
            id="contactInfo"
            name="contactInfo"
            type="text"
            value={values.contactInfo}
            onChange={(e) => set("contactInfo", e.target.value)}
            required
          />
        </div>
      </FormSection>

      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="mt-1 self-start">
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
