import { createReportAction } from "@/lib/actions/report-actions";
import { requireUser } from "@/lib/session";
import { ReportForm } from "@/components/reports/report-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
        <CardHeader>
          <CardTitle className="text-base">Report details</CardTitle>
          <CardDescription>Required fields are marked automatically by the form.</CardDescription>
        </CardHeader>
        <CardContent>
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
