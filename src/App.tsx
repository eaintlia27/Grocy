import { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Plus,
  RefreshCw,
  ShoppingBasket,
  ShoppingCart,
  Trash2,
} from 'lucide-react';
import { AuthScreen } from './components/AuthScreen';
import { ConfirmDialog } from './components/ConfirmDialog';
import { GreetingProgress } from './components/GreetingProgress';
import { GroceryItemRow } from './components/GroceryItemRow';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { QuickAddPanel } from './components/QuickAddPanel';
import { useAuth } from './hooks/useAuth';
import { useGroceryStore } from './hooks/useGroceryStore';
import { AppView } from './types/grocery';

export default function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const {
    items,
    loading: itemsLoading,
    error: storeError,
    needsSetup,
    theme,
    toggleTheme,
    refreshItems,
    addItem,
    updateItem,
    togglePurchased,
    deleteItem,
    clearPurchased,
  } = useGroceryStore(user);

  const [view, setView] = useState<AppView>('list');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  const unpurchasedItems = useMemo(
    () =>
      items
        .filter((item) => !item.purchased)
        .sort((a, b) => b.createdAt - a.createdAt),
    [items]
  );

  const purchasedItems = useMemo(
    () =>
      items
        .filter((item) => item.purchased)
        .sort((a, b) => (b.purchasedAt ?? b.createdAt) - (a.purchasedAt ?? a.createdAt)),
    [items]
  );

  const totalCount = items.length;
  const purchasedCount = purchasedItems.length;
  const remainingCount = unpurchasedItems.length;

  const userLabel = useMemo(() => {
    if (!user) return undefined;
    const fullName =
      typeof user.user_metadata?.full_name === 'string'
        ? user.user_metadata.full_name.trim()
        : '';
    if (fullName) return fullName;
    if (user.email) return user.email.split('@')[0];
    return undefined;
  }, [user]);

  const handleConfirmClearPurchased = async () => {
    await clearPurchased();
    setIsClearDialogOpen(false);
  };

  const handleOpenAddFromShopping = () => {
    setView('list');
    setIsAddOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-stone-900 dark:bg-[#141614] dark:text-stone-100 transition-colors">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        isAuthenticated={Boolean(user)}
        onSignOut={signOut}
      />

      {authLoading ? (
        <main className="mx-auto flex max-w-5xl items-center justify-center px-4 py-20">
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
            Checking your session...
          </p>
        </main>
      ) : !user ? (
        <main>
          <AuthScreen onSignIn={signIn} onSignUp={signUp} />
        </main>
      ) : (
        <>
          <main className="mx-auto max-w-5xl px-4 pt-6 pb-24 sm:px-6 md:pb-14 lg:px-8">
            {/* Desktop & tablet mode switcher */}
            <div className="mb-6 hidden md:flex items-center justify-between gap-4">
              <div
                role="tablist"
                aria-label="List view mode"
                className="inline-flex items-center gap-1 rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-[#1B1E1B] p-1"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={view === 'list'}
                  onClick={() => setView('list')}
                  className={`inline-flex min-h-[40px] items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                    view === 'list'
                      ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                      : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
                  }`}
                >
                  <ClipboardList className="h-4 w-4" aria-hidden="true" />
                  <span>My List</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={view === 'shopping'}
                  onClick={() => setView('shopping')}
                  className={`inline-flex min-h-[40px] items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                    view === 'shopping'
                      ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                      : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
                  }`}
                >
                  <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                  <span className="tabular-nums">
                    Shopping Mode{remainingCount > 0 ? ` (${remainingCount})` : ''}
                  </span>
                </button>
              </div>
            </div>

            {storeError && (
              <div
                role="alert"
                className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 text-sm text-amber-900 dark:text-amber-200"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden="true" />
                  <p>{storeError}</p>
                </div>
                <button
                  type="button"
                  onClick={refreshItems}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-amber-950/60 px-3 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
              {/* Left column: Greeting, progress & quick add */}
              <div className="space-y-5 lg:col-span-5 lg:sticky lg:top-6">
                <GreetingProgress
                  totalCount={totalCount}
                  purchasedCount={purchasedCount}
                  remainingCount={remainingCount}
                  view={view}
                  userLabel={userLabel}
                />

                {!needsSetup && (
                  <>
                    {view === 'list' ? (
                      <QuickAddPanel
                        isOpen={isAddOpen}
                        onOpen={() => setIsAddOpen(true)}
                        onClose={() => setIsAddOpen(false)}
                        onAddItem={addItem}
                      />
                    ) : (
                      <div className="hidden lg:block">
                        <button
                          type="button"
                          onClick={handleOpenAddFromShopping}
                          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1B1E1B] px-4 py-2.5 text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 transition-colors cursor-pointer"
                        >
                          <Plus className="h-4 w-4 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                          <span>Add forgotten item</span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Right column: Active list or shopping checklist */}
              <div className="space-y-8 lg:col-span-7">
                {itemsLoading ? (
                  <section
                    aria-label="Loading grocery list"
                    className="rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-[#1B1E1B] px-6 py-12 text-center"
                  >
                    <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
                      Loading your family grocery list...
                    </p>
                  </section>
                ) : totalCount === 0 ? (
                  <section
                    aria-label="Empty grocery list"
                    className="rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-[#1B1E1B] px-6 py-12 text-center"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                      <ShoppingBasket className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
                    </div>
                    <h2 className="mt-4 font-display text-lg font-semibold text-stone-900 dark:text-stone-100">
                      Your grocery list is empty. Add something you need!
                    </h2>
                    <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                      Start adding groceries and optional notes like brand or size so your next shopping trip stays effortless.
                    </p>

                    {!needsSetup && (!isAddOpen || view === 'shopping') && (
                      <div className="mt-6 flex justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setView('list');
                            setIsAddOpen(true);
                          }}
                          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 transition-colors cursor-pointer"
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                          <span>Add Item</span>
                        </button>
                      </div>
                    )}
                  </section>
                ) : (
                  <>
                    {/* To Buy Section */}
                    <section aria-labelledby="to-buy-heading" className="space-y-3">
                      <div className="flex items-center justify-between gap-4 px-1">
                        <h2
                          id="to-buy-heading"
                          className="font-display text-base font-semibold text-stone-900 dark:text-stone-100"
                        >
                          {view === 'shopping' ? 'Still to Buy' : 'To Buy'}
                        </h2>
                        <span className="text-xs font-medium text-stone-500 dark:text-stone-400 tabular-nums">
                          {remainingCount} {remainingCount === 1 ? 'item' : 'items'}
                        </span>
                      </div>

                      {remainingCount === 0 ? (
                        <div className="rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-[#1B1E1B] px-5 py-8 text-center">
                          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <p className="mt-3 font-display text-base font-semibold text-stone-900 dark:text-stone-100">
                            {view === 'shopping'
                              ? 'All items are in your cart!'
                              : 'Nothing left to buy'}
                          </p>
                          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                            All {totalCount} {totalCount === 1 ? 'item is' : 'items are'} checked off. You can uncheck any item below or clear purchased items.
                          </p>
                          {view === 'shopping' && (
                            <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                              <button
                                type="button"
                                onClick={() => setView('list')}
                                className="min-h-[44px] rounded-xl border border-stone-200 dark:border-stone-700 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 transition-colors cursor-pointer"
                              >
                                Back to My List
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsClearDialogOpen(true)}
                                className="min-h-[44px] rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 transition-colors cursor-pointer"
                              >
                                Clear Purchased Items
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <ul className="space-y-2.5">
                          {unpurchasedItems.map((item) => (
                            <GroceryItemRow
                              key={item.id}
                              item={item}
                              mode={view}
                              onToggle={togglePurchased}
                              onUpdate={updateItem}
                              onDelete={deleteItem}
                            />
                          ))}
                        </ul>
                      )}
                    </section>

                    {/* Purchased Section */}
                    {purchasedCount > 0 && (
                      <section aria-labelledby="purchased-heading" className="space-y-3 pt-2">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200/80 dark:border-stone-800 pt-5 px-1">
                          <div className="flex items-baseline gap-2">
                            <h2
                              id="purchased-heading"
                              className="font-display text-base font-semibold text-stone-700 dark:text-stone-300"
                            >
                              Purchased
                            </h2>
                            <span className="text-xs font-medium text-stone-500 dark:text-stone-400 tabular-nums">
                              · {purchasedCount}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsClearDialogOpen(true)}
                            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-stone-600 hover:bg-rose-50 hover:text-rose-700 dark:text-stone-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            <span>Clear Purchased Items</span>
                          </button>
                        </div>

                        <ul className="space-y-2">
                          {purchasedItems.map((item) => (
                            <GroceryItemRow
                              key={item.id}
                              item={item}
                              mode={view}
                              onToggle={togglePurchased}
                              onUpdate={updateItem}
                              onDelete={deleteItem}
                            />
                          ))}
                        </ul>
                      </section>
                    )}
                  </>
                )}
              </div>
            </div>
          </main>

          <MobileBottomNav
            view={view}
            remainingCount={remainingCount}
            onChangeView={setView}
          />

          <ConfirmDialog
            open={isClearDialogOpen}
            purchasedCount={purchasedCount}
            onConfirm={handleConfirmClearPurchased}
            onCancel={() => setIsClearDialogOpen(false)}
          />
        </>
      )}
    </div>
  );
}
