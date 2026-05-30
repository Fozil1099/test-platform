import { Modal } from "./modal";
import { Button } from "./button";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading,
}: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="mb-6 text-gray-600">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          Отмена
        </Button>
        <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
          Удалить
        </Button>
      </div>
    </Modal>
  );
}
