import Link from "next/link";
import { notFound } from "next/navigation";

import { getReportById } from "@/lib/reports/queries";
import { requireUser } from "@/lib/session";
import { resolveReportAction } from "@/lib/actions/report-actions";
import { CATEGORY_LABELS, TIME_OF_DAY_LABELS } from "@/lib/reports/labels";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const report = await getReportById(id);
  if (!report) notFound();

  const isOwner = report.reporterId === user.id;
  const boundResolve = resolveReportAction.bind(null, report.id);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-12">
      <div className="flex items-center gap-2">
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium ${
            report.type === "LOST"
              ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
              : "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
          }`}
        >
          {report.type}
        </span>
        <span className="rounded bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {report.status}
        </span>
      </div>

      <h1 className="text-2xl font-semibold">{report.itemName}</h1>

      {report.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={report.imageUrl}
          alt={report.itemName}
          className="max-h-80 w-full rounded object-cover"
        />
      )}

      <dl className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
        <dt className="text-zinc-500">Category</dt>
        <dd className="col-span-2">{CATEGORY_LABELS[report.category]}</dd>

        <dt className="text-zinc-500">Description</dt>
        <dd className="col-span-2 whitespace-pre-wrap">{report.description}</dd>

        <dt className="text-zinc-500">Date</dt>
        <dd className="col-span-2">{report.date.toISOString().slice(0, 10)}</dd>

        {report.timeOfDay && (
          <>
            <dt className="text-zinc-500">Approx. time</dt>
            <dd className="col-span-2">{TIME_OF_DAY_LABELS[report.timeOfDay]}</dd>
          </>
        )}

        <dt className="text-zinc-500">Location</dt>
        <dd className="col-span-2">
          {report.location}
          {report.locationDetail ? ` — ${report.locationDetail}` : ""}
        </dd>

        {report.color && (
          <>
            <dt className="text-zinc-500">Color</dt>
            <dd className="col-span-2">{report.color}</dd>
          </>
        )}

        {report.brand && (
          <>
            <dt className="text-zinc-500">Brand</dt>
            <dd className="col-span-2">{report.brand}</dd>
          </>
        )}

        <dt className="text-zinc-500">Contact</dt>
        <dd className="col-span-2">{report.contactInfo}</dd>

        <dt className="text-zinc-500">Reported by</dt>
        <dd className="col-span-2">{report.reporter.name}</dd>
      </dl>

      {isOwner && (
        <div className="flex gap-4 pt-2">
          {report.status === "ACTIVE" && (
            <>
              <Link href={`/reports/${report.id}/edit`} className="text-sm font-medium underline">
                Edit
              </Link>
              <form action={boundResolve}>
                <button
                  type="submit"
                  className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-black"
                >
                  Mark as resolved
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
