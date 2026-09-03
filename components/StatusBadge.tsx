import type { ApplicationStatus } from "@/lib/types";

const statusStyles: Record<ApplicationStatus, string> = {
  Applied: "bg-blue-100 text-blue-800",
  Interview: "bg-yellow-100 text-yellow-900",
  Offer: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};

const statusIcons: Record<ApplicationStatus, string> = {
  Applied: "●",
  Interview: "▲",
  Offer: "✓",
  Rejected: "✕",
};

export default function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      <span aria-hidden="true">{statusIcons[status]}</span>
      {status}
    </span>
  );
}
