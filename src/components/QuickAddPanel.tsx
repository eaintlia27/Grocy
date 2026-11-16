import { FormEvent, useEffect, useRef, useState } from 'react';
import { Check, Plus, X } from 'lucide-react';

interface QuickAddPanelProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onAddItem: (name: string, note?: string) => Promise<boolean> | boolean;
}

export function QuickAddPanel({
  isOpen,
  onOpen,
  onClose,
  onAddItem,
}: QuickAddPanelProps) {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastAddedName, setLastAddedName] = useState('');

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      nameInputRef.current?.focus();
    } else {
      setError('');
      setLastAddedName('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!lastAddedName) return;
    const timer = window.setTimeout(() => {
      setLastAddedName('');
    }, 2400);
    return () => window.clearTimeout(timer);
  }, [lastAddedName]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter an item name.');
      nameInputRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const added = await onAddItem(trimmed, note);
      if (added) {
        setLastAddedName(trimmed);
        setName('');
        setNote('');
        setError('');
        nameInputRef.current?.focus();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <div>
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-xs hover:bg-emerald-800 active:scale-[0.99] dark:bg-emerald-600 dark:hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#141614] transition-all cursor-pointer"
        >
          <Plus className="h-5 w-5" strokeWidth={2.2} aria-hidden="true" />
          <span>Add Item</span>
        </button>
      </div>
    );
  }

  return (
    <section
      aria-label="Add grocery item"
      className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1B1E1B] p-4 sm:p-5 shadow-xs"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-base font-semibold text-stone-900 dark:text-stone-100">
          Add grocery item
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close add item form"
          className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-stone-500 hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-3.5 space-y-3">
        <div>
          <label
            htmlFor="quick-add-name"
            className="block text-xs font-medium text-stone-700 dark:text-stone-300"
          >
            Item name <span className="text-emerald-700 dark:text-emerald-400">*</span>
          </label>
          <input
            ref={nameInputRef}
            id="quick-add-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
            placeholder="e.g. Organic oat milk"
            autoComplete="off"
            maxLength={120}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'quick-add-error' : undefined}
            className="mt-1.5 block min-h-[44px] w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-[#141614] px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-emerald-600 focus:bg-white dark:focus:border-emerald-500 dark:focus:bg-[#141614] focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition-colors"
          />
          {error && (
            <p
              id="quick-add-error"
              role="alert"
              className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400"
            >
              {error}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="quick-add-note"
            className="block text-xs font-medium text-stone-700 dark:text-stone-300"
          >
            Optional note
          </label>
          <input
            id="quick-add-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
            placeholder="Brand, quantity, size, or details"
            autoComplete="off"
            maxLength={180}
            className="mt-1.5 block min-h-[44px] w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-[#141614] px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-emerald-600 focus:bg-white dark:focus:border-emerald-500 dark:focus:bg-[#141614] focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="min-h-[20px]">
            {lastAddedName ? (
              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate max-w-[180px]">Added {lastAddedName}</span>
              </p>
            ) : (
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Press Enter to save and add another
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-xl border border-stone-200 dark:border-stone-700 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 transition-colors cursor-pointer"
            >
              Done
            </button>
            <button
              type="submit"
              className="min-h-[44px] rounded-xl bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 transition-colors cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
