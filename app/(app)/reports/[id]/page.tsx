import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Palette, Tag, User } from "lucide-react";

import { getReportById } from "@/lib/reports/queries";
import { requireUser } from "@/lib/session";
import { resolveReportAction } from "@/lib/actions/report-actions";
import { CATEGORY_LABELS, TIME_OF_DAY_LABELS } from "@/lib/reports/labels";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ReportTypeBadge } from "@/components/reports/report-type-badge";
import { cn } from "@/lib/utils";

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div>
        <dt className="text-muted-foreground">{label}</dt>
        <dd className="text-foreground">{children}</dd>
      </div>
    </div>
  );
}

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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <Link href="/reports" className="w-fit text-sm font-medium text-primary hover:underline">
        ← Back to reports
      </Link>
      <Card>
        <CardHeader className="gap-3">
          <div className="flex items-center gap-2">
            <ReportTypeBadge type={report.type} />
            {report.status === "RESOLVED" && <Badge variant="resolved">Resolved</Badge>}
          </div>
          <h1 className="text-2xl font-semibold text-foreground">{report.itemName}</h1>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          {report.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={report.imageUrl}
              alt={report.itemName}
              className="max-h-80 w-full rounded-md border border-border object-cover"
            />
          )}

          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {report.description}
          </p>

          <Separator />

          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailRow icon={Tag} label="Category">
              {CATEGORY_LABELS[report.category]}
            </DetailRow>

            <DetailRow icon={CalendarDays} label="Date">
              {report.date.toISOString().slice(0, 10)}
              {report.timeOfDay ? ` · ${TIME_OF_DAY_LABELS[report.timeOfDay]}` : ""}
            </DetailRow>

            <DetailRow icon={MapPin} label="Location">
              {report.location}
              {report.locationDetail ? ` — ${report.locationDetail}` : ""}
            </DetailRow>

            {(report.color || report.brand) && (
              <DetailRow icon={Palette} label="Color / brand">
                {[report.color, report.brand].filter(Boolean).join(" · ")}
              </DetailRow>
            )}

            <DetailRow icon={User} label="Reported by">
              {report.reporter.name}
            </DetailRow>
          </dl>

          <Separator />

          <div className="rounded-md bg-muted p-4 text-sm">
            <p className="font-medium text-foreground">Contact</p>
            <p className="mt-0.5 text-muted-foreground">
              {report.contactInfo.includes("@") ? (
                <a href={`mailto:${report.contactInfo}`} className="text-primary hover:underline">
                  {report.contactInfo}
                </a>
              ) : (
                report.contactInfo
              )}
            </p>
          </div>

          {isOwner && report.status === "ACTIVE" && (
            <div className="flex gap-3 pt-2">
              <Link
                href={`/reports/${report.id}/edit`}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Edit
              </Link>
              <form action={boundResolve}>
                <Button type="submit" variant="secondary">
                  Mark as resolved
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
