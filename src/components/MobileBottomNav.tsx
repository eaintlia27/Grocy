import { ClipboardList, ShoppingCart } from 'lucide-react';
import { AppView } from '../types/grocery';

interface MobileBottomNavProps {
  view: AppView;
  remainingCount: number;
  onChangeView: (view: AppView) => void;
}

export function MobileBottomNav({
  view,
  remainingCount,
  onChangeView,
}: MobileBottomNavProps) {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-[#141614]/95 backdrop-blur-md md:hidden"
    >
      <div className="mx-auto grid h-14 max-w-md grid-cols-2">
        <button
          type="button"
          onClick={() => onChangeView('list')}
          aria-current={view === 'list' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600 cursor-pointer ${
            view === 'list'
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <ClipboardList className="h-5 w-5" strokeWidth={view === 'list' ? 2.2 : 1.8} aria-hidden="true" />
          <span className="whitespace-nowrap">My List</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeView('shopping')}
          aria-current={view === 'shopping' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600 cursor-pointer ${
            view === 'shopping'
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <ShoppingCart className="h-5 w-5" strokeWidth={view === 'shopping' ? 2.2 : 1.8} aria-hidden="true" />
          <span className="whitespace-nowrap tabular-nums">
            Shopping Mode{remainingCount > 0 ? ` (${remainingCount})` : ''}
          </span>
        </button>
      </div>
    </nav>
  );
}
