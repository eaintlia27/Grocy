import { LogOut, Moon, ShoppingBasket, Sun } from 'lucide-react';
import { ThemeMode } from '../types/grocery';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  isAuthenticated?: boolean;
  onSignOut?: () => void;
}

export function Header({
  theme,
  onToggleTheme,
  isAuthenticated = false,
  onSignOut,
}: HeaderProps) {
  const isDark = theme === 'dark';

  return (
    <header className="border-b border-stone-200/80 dark:border-stone-800 bg-[#F7F7F5]/95 dark:bg-[#141614]/95">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5 shrink-0">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
            aria-hidden="true"
          >
            <ShoppingBasket className="h-5 w-5" strokeWidth={1.9} />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100 whitespace-nowrap">
            My Grocery List
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1C1F1C] px-3 py-2 text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isDark ? (
              <>
                <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-stone-600" aria-hidden="true" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {isAuthenticated && onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              aria-label="Sign out"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1C1F1C] px-3 py-2 text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="h-4 w-4 text-stone-500 dark:text-stone-400" aria-hidden="true" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
