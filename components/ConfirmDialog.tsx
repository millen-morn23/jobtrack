"use client";

import Modal from "@/components/Modal";
import Button from "@/components/Button";

type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  title,
  description,
  confirmLabel = "Delete",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      title={title}
      description={description}
      onClose={onCancel}
      className="max-w-sm"
    >
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          type="button"
          variant="danger"
          onClick={onConfirm}
          loading={loading}
          loadingText="Deleting..."
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
