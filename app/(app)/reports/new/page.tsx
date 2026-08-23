import { createReportAction } from "@/lib/actions/report-actions";
import { requireUser } from "@/lib/session";
import { ReportForm } from "@/components/reports/report-form";
import { Card, CardContent } from "@/components/ui/card";

export default async function NewReportPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Create a report</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The more detail you provide, the stronger your potential matches will be.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <ReportForm
            action={createReportAction}
            defaults={{ contactInfo: user.email ?? "" }}
            submitLabel="Create report"
          />
        </CardContent>
      </Card>
    </div>
  );
}
