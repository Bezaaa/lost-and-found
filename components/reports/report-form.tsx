"use client";

import { useActionState } from "react";
import { ItemCategory, ReportType, TimeOfDay } from "@prisma/client";

import type { ReportFormState } from "@/lib/actions/report-actions";
import { CATEGORY_LABELS, TIME_OF_DAY_LABELS } from "@/lib/reports/labels";

const inputClass =
  "rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

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

export function ReportForm({
  action,
  defaults,
  submitLabel,
  fixedType,
}: {
  action: (state: ReportFormState, formData: FormData) => Promise<ReportFormState>;
  defaults?: ReportFormDefaults;
  submitLabel: string;
  /** When set, the report type is fixed (edit mode) instead of user-selectable (create mode). */
  fixedType?: ReportType;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex w-full max-w-xl flex-col gap-4">
      {fixedType ? (
        <input type="hidden" name="type" value={fixedType} />
      ) : (
        <fieldset className="flex flex-col gap-1">
          <legend className="text-sm font-medium">Report type</legend>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="type"
                value={ReportType.LOST}
                defaultChecked={defaults?.type !== ReportType.FOUND}
                required
              />
              Lost
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="type"
                value={ReportType.FOUND}
                defaultChecked={defaults?.type === ReportType.FOUND}
              />
              Found
            </label>
          </div>
        </fieldset>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="category" className="text-sm font-medium">
          Category
        </label>
        <select
          id="category"
          name="category"
          defaultValue={defaults?.category ?? ""}
          required
          className={inputClass}
        >
          <option value="" disabled>
            Select a category
          </option>
          {Object.values(ItemCategory).map((value) => (
            <option key={value} value={value}>
              {CATEGORY_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="itemName" className="text-sm font-medium">
          Item name
        </label>
        <input
          id="itemName"
          name="itemName"
          type="text"
          defaultValue={defaults?.itemName}
          required
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={defaults?.description}
          required
          className={inputClass}
        />
      </div>

      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="date" className="text-sm font-medium">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={defaults?.date}
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="timeOfDay" className="text-sm font-medium">
            Approximate time (optional)
          </label>
          <select
            id="timeOfDay"
            name="timeOfDay"
            defaultValue={defaults?.timeOfDay ?? ""}
            className={inputClass}
          >
            <option value="">Unspecified</option>
            {Object.values(TimeOfDay).map((value) => (
              <option key={value} value={value}>
                {TIME_OF_DAY_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="location" className="text-sm font-medium">
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          defaultValue={defaults?.location}
          required
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="locationDetail" className="text-sm font-medium">
          Additional location detail (optional)
        </label>
        <input
          id="locationDetail"
          name="locationDetail"
          type="text"
          defaultValue={defaults?.locationDetail ?? ""}
          className={inputClass}
        />
      </div>

      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="color" className="text-sm font-medium">
            Color (optional)
          </label>
          <input
            id="color"
            name="color"
            type="text"
            defaultValue={defaults?.color ?? ""}
            className={inputClass}
          />
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="brand" className="text-sm font-medium">
            Brand (optional)
          </label>
          <input
            id="brand"
            name="brand"
            type="text"
            defaultValue={defaults?.brand ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="imageUrl" className="text-sm font-medium">
          Image URL (optional)
        </label>
        <input
          id="imageUrl"
          name="imageUrl"
          type="url"
          defaultValue={defaults?.imageUrl ?? ""}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="contactInfo" className="text-sm font-medium">
          Contact information
        </label>
        <input
          id="contactInfo"
          name="contactInfo"
          type="text"
          defaultValue={defaults?.contactInfo}
          required
          className={inputClass}
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
