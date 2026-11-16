import { useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  purchasedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  purchasedCount,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const itemWord = purchasedCount === 1 ? 'item' : 'items';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 px-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="clear-dialog-title"
      aria-describedby="clear-dialog-description"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1B1E1B] p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400"
            aria-hidden="true"
          >
            <Trash2 className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id="clear-dialog-title"
              className="font-display text-lg font-semibold text-stone-900 dark:text-stone-100"
            >
              Clear purchased items?
            </h2>
            <p
              id="clear-dialog-description"
              className="mt-1.5 text-sm leading-relaxed text-stone-600 dark:text-stone-400"
            >
              This will permanently remove {purchasedCount} purchased {itemWord} from your list. Any items you still need to buy will stay saved.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="min-h-[44px] rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/60 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-[44px] rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors cursor-pointer"
          >
            Clear Purchased
          </button>
        </div>
      </div>
    </div>
  );
}
