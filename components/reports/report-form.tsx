"use client";

import { useActionState, useState } from "react";
import { ItemCategory, ReportType, TimeOfDay } from "@prisma/client";

import type { ReportFormState } from "@/lib/actions/report-actions";
import { CATEGORY_LABELS, TIME_OF_DAY_LABELS } from "@/lib/reports/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
    <form action={formAction} className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-foreground">Report type</legend>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="radio"
              name="type"
              value={ReportType.LOST}
              checked={values.type === ReportType.LOST}
              onChange={() => set("type", ReportType.LOST)}
              required
              className="accent-rose-600"
            />
            Lost
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="radio"
              name="type"
              value={ReportType.FOUND}
              checked={values.type === ReportType.FOUND}
              onChange={() => set("type", ReportType.FOUND)}
              className="accent-teal-600"
            />
            Found
          </label>
        </div>
      </fieldset>

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
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          required
        />
      </div>

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
          <Label htmlFor="timeOfDay">Approximate time (optional)</Label>
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
          value={values.location}
          onChange={(e) => set("location", e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="locationDetail">Additional location detail (optional)</Label>
        <Input
          id="locationDetail"
          name="locationDetail"
          type="text"
          value={values.locationDetail}
          onChange={(e) => set("locationDetail", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="color">Color (optional)</Label>
          <Input
            id="color"
            name="color"
            type="text"
            value={values.color}
            onChange={(e) => set("color", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="brand">Brand (optional)</Label>
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
        <Label htmlFor="imageUrl">Image URL (optional)</Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          type="url"
          value={values.imageUrl}
          onChange={(e) => set("imageUrl", e.target.value)}
        />
      </div>

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

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="mt-1 self-start">
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
