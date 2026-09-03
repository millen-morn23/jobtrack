import type { Application } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import Button from "@/components/Button";

type ApplicationCardProps = {
  application: Application;
  onView: (application: Application) => void;
  onEdit?: (application: Application) => void;
  onDelete?: (application: Application) => void;
  /** Compact preview mode (e.g. dashboard): only the View action is shown. */
  compact?: boolean;
};

export default function ApplicationCard({
  application,
  onView,
  onEdit,
  onDelete,
  compact = false,
}: ApplicationCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {application.position}
          </h3>
          <p className="font-medium text-slate-700">{application.company}</p>
        </div>

        <StatusBadge status={application.status} />
      </div>

      <dl className="mb-5 space-y-2 text-sm text-slate-600">
        <div className="flex justify-between gap-4">
          <dt className="font-medium text-slate-800">Location</dt>
          <dd className="text-right">
            {application.location || "Not specified"}
          </dd>
        </div>

        <div className="flex justify-between gap-4">
          <dt className="font-medium text-slate-800">Date Applied</dt>
          <dd className="text-right">{application.dateApplied}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => onView(application)}
        >
          View Details
        </Button>

        {!compact && onEdit && (
          <Button
            type="button"
            variant="secondary"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
            onClick={() => onEdit(application)}
          >
            Edit
          </Button>
        )}

        {!compact && onDelete && (
          <Button
            type="button"
            variant="danger"
            onClick={() => onDelete(application)}
          >
            Delete
          </Button>
        )}
      </div>
    </article>
  );
}
