import { createReportAction } from "@/lib/actions/report-actions";
import { requireUser } from "@/lib/session";
import { ReportForm } from "@/components/reports/report-form";
import { Modal } from "@/components/ui/modal";

export default async function NewReportModal() {
  const user = await requireUser();

  return (
    <Modal title="Create a report">
      <p className="mb-5 text-sm text-muted-foreground">
        The more detail you provide, the stronger your potential matches will be.
      </p>
      <ReportForm
        action={createReportAction}
        defaults={{ contactInfo: user.email ?? "" }}
        submitLabel="Create report"
      />
    </Modal>
  );
}
