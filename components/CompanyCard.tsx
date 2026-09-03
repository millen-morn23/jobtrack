import type { CompanyWithCounts } from "@/lib/types";
import Button from "@/components/Button";

type CompanyCardProps = {
  company: CompanyWithCounts;
  onView: (company: CompanyWithCounts) => void;
  onEdit: (company: CompanyWithCounts) => void;
  onDelete: (company: CompanyWithCounts) => void;
};

export default function CompanyCard({
  company,
  onView,
  onEdit,
  onDelete,
}: CompanyCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{company.name}</h3>

        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-700 hover:underline"
          >
            {company.website.replace(/^https?:\/\//, "")}
          </a>
        )}
      </div>

      <dl className="mb-5 space-y-2 text-sm text-slate-600">
        {company.industry && (
          <div className="flex justify-between gap-4">
            <dt className="font-medium text-slate-800">Industry</dt>
            <dd className="text-right">{company.industry}</dd>
          </div>
        )}

        {company.location && (
          <div className="flex justify-between gap-4">
            <dt className="font-medium text-slate-800">Location</dt>
            <dd className="text-right">{company.location}</dd>
          </div>
        )}

        <div className="flex justify-between gap-4">
          <dt className="font-medium text-slate-800">Contacts</dt>
          <dd className="text-right">{company.contactCount}</dd>
        </div>

        <div className="flex justify-between gap-4">
          <dt className="font-medium text-slate-800">Applications</dt>
          <dd className="text-right">{company.applicationCount}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => onView(company)}
        >
          View / Contacts
        </Button>

        <Button
          type="button"
          variant="secondary"
          className="border-blue-300 text-blue-700 hover:bg-blue-50"
          onClick={() => onEdit(company)}
        >
          Edit
        </Button>

        <Button
          type="button"
          variant="danger"
          onClick={() => onDelete(company)}
        >
          Delete
        </Button>
      </div>
    </article>
  );
}
