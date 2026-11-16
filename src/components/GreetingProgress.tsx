import { AppView } from '../types/grocery';

interface GreetingProgressProps {
  totalCount: number;
  purchasedCount: number;
  remainingCount: number;
  view: AppView;
  userLabel?: string;
}

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getHelperMessage(
  totalCount: number,
  remainingCount: number,
  view: AppView
): string {
  if (totalCount === 0) {
    return 'Jot down items as you run low so nothing gets forgotten on shopping day.';
  }
  if (remainingCount === 0) {
    return 'Everything on your list has been picked up.';
  }
  if (view === 'shopping') {
    return 'Tap any item below as you place it in your cart.';
  }
  return 'Shared with your family. Add items anytime and switch to Shopping Mode at the store.';
}

export function GreetingProgress({
  totalCount,
  purchasedCount,
  remainingCount,
  view,
  userLabel,
}: GreetingProgressProps) {
  const greeting = getTimeGreeting();
  const helperMessage = getHelperMessage(totalCount, remainingCount, view);
  const progressPercent =
    totalCount > 0 ? Math.round((purchasedCount / totalCount) * 100) : 0;

  return (
    <section aria-label="Shopping summary" className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-3xl text-balance">
          {userLabel ? `${greeting}, ${userLabel}` : greeting}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-stone-600 dark:text-stone-400 sm:text-base max-w-2xl">
          {helperMessage}
        </p>
      </div>

      {totalCount > 0 && (
        <div className="rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-[#1B1E1B] p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 tabular-nums">
              {purchasedCount} of {totalCount} {totalCount === 1 ? 'item' : 'items'} completed
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500 dark:text-stone-400 tabular-nums">
              <span>{remainingCount} left to buy</span>
              <span aria-hidden="true">·</span>
              <span>{totalCount} total</span>
            </div>
          </div>

          <div
            className="mt-3 h-2 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Shopping progress"
          >
            <div
              className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500 transition-[width] duration-200 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
