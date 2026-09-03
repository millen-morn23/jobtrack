import { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>

      {description && (
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      )}

      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
