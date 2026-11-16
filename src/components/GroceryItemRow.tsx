import { FormEvent, useEffect, useRef, useState } from 'react';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { AppView, GroceryItem } from '../types/grocery';

interface GroceryItemRowProps {
  item: GroceryItem;
  mode: AppView;
  onToggle: (id: string) => void;
  onUpdate: (id: string, name: string, note?: string) => Promise<boolean> | boolean;
  onDelete: (id: string) => void;
}

export function GroceryItemRow({
  item,
  mode,
  onToggle,
  onUpdate,
  onDelete,
}: GroceryItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editNote, setEditNote] = useState(item.note ?? '');
  const [editError, setEditError] = useState('');
  const editNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      editNameRef.current?.focus();
    }
  }, [isEditing]);

  const startEdit = () => {
    setEditName(item.name);
    setEditNote(item.note ?? '');
    setEditError('');
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditError('');
  };

  const handleEditSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = editName.trim();
    if (!trimmed) {
      setEditError('Item name is required.');
      editNameRef.current?.focus();
      return;
    }
    const ok = await onUpdate(item.id, trimmed, editNote);
    if (ok) {
      setIsEditing(false);
      setEditError('');
    }
  };

  if (mode === 'shopping') {
    return (
      <li>
        <button
          type="button"
          onClick={() => onToggle(item.id)}
          aria-pressed={item.purchased}
          className={`group flex min-h-[60px] w-full items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 cursor-pointer ${
            item.purchased
              ? 'border-stone-200/70 dark:border-stone-800/70 bg-stone-100/70 dark:bg-[#171917] text-stone-500 dark:text-stone-400'
              : 'border-stone-200/90 dark:border-stone-800 bg-white dark:bg-[#1B1E1B] hover:border-emerald-600/40 dark:hover:border-emerald-500/40 active:bg-stone-50 dark:active:bg-stone-800/50'
          }`}
        >
          <span
            aria-hidden="true"
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors ${
              item.purchased
                ? 'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500'
                : 'border-stone-300 dark:border-stone-600 bg-white dark:bg-[#141614] group-hover:border-emerald-600 dark:group-hover:border-emerald-400'
            }`}
          >
            {item.purchased && <Check className="h-4 w-4" strokeWidth={2.5} />}
          </span>

          <div className="min-w-0 flex-1">
            <p
              className={`text-base font-medium leading-snug break-words ${
                item.purchased
                  ? 'line-through text-stone-500 dark:text-stone-400'
                  : 'text-stone-900 dark:text-stone-100'
              }`}
            >
              {item.name}
            </p>
            {item.note && (
              <p
                className={`mt-0.5 text-sm leading-snug break-words ${
                  item.purchased
                    ? 'text-stone-400 dark:text-stone-500'
                    : 'text-stone-500 dark:text-stone-400'
                }`}
              >
                {item.note}
              </p>
            )}
          </div>
        </button>
      </li>
    );
  }

  if (isEditing) {
    return (
      <li className="rounded-2xl border border-emerald-600/40 dark:border-emerald-500/40 bg-white dark:bg-[#1B1E1B] p-4 shadow-xs">
        <form onSubmit={handleEditSubmit} noValidate className="space-y-3">
          <div>
            <label
              htmlFor={`edit-name-${item.id}`}
              className="block text-xs font-medium text-stone-700 dark:text-stone-300"
            >
              Item name
            </label>
            <input
              ref={editNameRef}
              id={`edit-name-${item.id}`}
              type="text"
              value={editName}
              onChange={(e) => {
                setEditName(e.target.value);
                if (editError) setEditError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') cancelEdit();
              }}
              maxLength={120}
              className="mt-1 block min-h-[44px] w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-[#141614] px-3 py-2 text-sm text-stone-900 dark:text-stone-100 focus:border-emerald-600 focus:bg-white dark:focus:border-emerald-500 dark:focus:bg-[#141614] focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
            {editError && (
              <p role="alert" className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                {editError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={`edit-note-${item.id}`}
              className="block text-xs font-medium text-stone-700 dark:text-stone-300"
            >
              Optional note
            </label>
            <input
              id={`edit-note-${item.id}`}
              type="text"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') cancelEdit();
              }}
              placeholder="Brand, quantity, or size (optional)"
              maxLength={180}
              className="mt-1 block min-h-[44px] w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-[#141614] px-3 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-emerald-600 focus:bg-white dark:focus:border-emerald-500 dark:focus:bg-[#141614] focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={cancelEdit}
              className="min-h-[44px] rounded-xl border border-stone-200 dark:border-stone-700 px-3.5 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 transition-colors cursor-pointer"
            >
              Save
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li
      className={`flex items-center gap-2 rounded-2xl border px-2 py-2 sm:px-3 transition-colors ${
        item.purchased
          ? 'border-stone-200/70 dark:border-stone-800/70 bg-stone-100/60 dark:bg-[#171917]'
          : 'border-stone-200/90 dark:border-stone-800 bg-white dark:bg-[#1B1E1B]'
      }`}
    >
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        aria-label={
          item.purchased
            ? `Uncheck ${item.name}`
            : `Mark ${item.name} as purchased`
        }
        aria-pressed={item.purchased}
        className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 cursor-pointer group"
      >
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
            item.purchased
              ? 'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500'
              : 'border-stone-300 dark:border-stone-600 bg-white dark:bg-[#141614] group-hover:border-emerald-600 dark:group-hover:border-emerald-400'
          }`}
        >
          {item.purchased && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
        </span>
      </button>

      <div className="min-w-0 flex-1 py-1">
        <p
          className={`text-sm sm:text-base font-medium leading-snug break-words ${
            item.purchased
              ? 'line-through text-stone-500 dark:text-stone-400'
              : 'text-stone-900 dark:text-stone-100'
          }`}
        >
          {item.name}
        </p>
        {item.note && (
          <p
            className={`mt-0.5 text-xs sm:text-sm leading-snug break-words ${
              item.purchased
                ? 'text-stone-400 dark:text-stone-500'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            {item.note}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={startEdit}
          aria-label={`Edit ${item.name}`}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 transition-colors cursor-pointer"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          aria-label={`Delete ${item.name}`}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-stone-500 hover:bg-rose-50 hover:text-rose-600 dark:text-stone-400 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors cursor-pointer"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}
