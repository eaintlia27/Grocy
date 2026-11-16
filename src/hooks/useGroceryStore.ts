import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { GroceryItem, ThemeMode } from '../types/grocery';

const THEME_STORAGE_KEY = 'my-grocery-list:theme:v1';

interface DbGroceryRow {
  id: string;
  name: string;
  note: string | null;
  purchased: boolean;
  created_by: string | null;
  created_at: string;
  purchased_at: string | null;
}

function mapRowToItem(row: DbGroceryRow): GroceryItem {
  return {
    id: row.id,
    name: row.name,
    ...(row.note ? { note: row.note } : {}),
    purchased: Boolean(row.purchased),
    createdAt: Date.parse(row.created_at) || Date.now(),
    ...(row.purchased_at ? { purchasedAt: Date.parse(row.purchased_at) } : {}),
  };
}

function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === '42P01' || error.code === 'PGRST205') return true;
  return Boolean(
    error.message &&
      (/relation .*grocery_items.* does not exist/i.test(error.message) ||
        /could not find the table .*grocery_items/i.test(error.message))
  );
}

function readInitialTheme(): ThemeMode {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
  } catch {
    // Ignore storage read failures
  }
  return 'light';
}

export function useGroceryStore(user: User | null) {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(readInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage quota errors
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const fetchItems = useCallback(async () => {
    if (!user) {
      setItems([]);
      setError(null);
      setNeedsSetup(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('grocery_items')
      .select('id, name, note, purchased, created_by, created_at, purchased_at')
      .order('created_at', { ascending: false });

    if (fetchError) {
      if (isMissingTableError(fetchError)) {
        setNeedsSetup(true);
        setError(
          'Your Supabase grocery_items table is not set up yet. Run the setup SQL in your Supabase SQL Editor, then click Retry.'
        );
      } else {
        setNeedsSetup(false);
        setError(fetchError.message);
      }
      setLoading(false);
      return;
    }

    setNeedsSetup(false);
    setItems(((data ?? []) as DbGroceryRow[]).map(mapRowToItem));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('family-grocery-items')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'grocery_items' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const mapped = mapRowToItem(payload.new as DbGroceryRow);
            setItems((prev) =>
              prev.some((item) => item.id === mapped.id) ? prev : [mapped, ...prev]
            );
          } else if (payload.eventType === 'UPDATE') {
            const mapped = mapRowToItem(payload.new as DbGroceryRow);
            setItems((prev) =>
              prev.map((item) => (item.id === mapped.id ? mapped : item))
            );
          } else if (payload.eventType === 'DELETE') {
            const oldRow = payload.old as { id?: string };
            if (oldRow?.id) {
              setItems((prev) => prev.filter((item) => item.id !== oldRow.id));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addItem = useCallback(
    async (rawName: string, rawNote?: string): Promise<boolean> => {
      if (!user) return false;
      const name = rawName.trim();
      if (!name) return false;

      const trimmedNote = rawNote?.trim();
      setError(null);

      const { data, error: insertError } = await supabase
        .from('grocery_items')
        .insert({
          name,
          note: trimmedNote || null,
          purchased: false,
          created_by: user.id,
        })
        .select('id, name, note, purchased, created_by, created_at, purchased_at')
        .single();

      if (insertError || !data) {
        if (isMissingTableError(insertError)) {
          setNeedsSetup(true);
        }
        setError(insertError?.message ?? 'Could not add item.');
        return false;
      }

      const mapped = mapRowToItem(data as DbGroceryRow);
      setItems((prev) =>
        prev.some((item) => item.id === mapped.id) ? prev : [mapped, ...prev]
      );
      return true;
    },
    [user]
  );

  const updateItem = useCallback(
    async (id: string, rawName: string, rawNote?: string): Promise<boolean> => {
      if (!user) return false;
      const name = rawName.trim();
      if (!name) return false;

      const trimmedNote = rawNote?.trim();
      const previousItems = items;
      setError(null);

      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          return {
            id: item.id,
            name,
            purchased: item.purchased,
            createdAt: item.createdAt,
            ...(item.purchasedAt !== undefined ? { purchasedAt: item.purchasedAt } : {}),
            ...(trimmedNote ? { note: trimmedNote } : {}),
          };
        })
      );

      const { error: updateError } = await supabase
        .from('grocery_items')
        .update({
          name,
          note: trimmedNote || null,
        })
        .eq('id', id);

      if (updateError) {
        setItems(previousItems);
        setError(updateError.message);
        return false;
      }

      return true;
    },
    [items, user]
  );

  const togglePurchased = useCallback(
    async (id: string) => {
      if (!user) return;
      const target = items.find((item) => item.id === id);
      if (!target) return;

      const nextPurchased = !target.purchased;
      const nextPurchasedAt = nextPurchased ? Date.now() : undefined;
      const previousItems = items;
      setError(null);

      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                purchased: nextPurchased,
                purchasedAt: nextPurchasedAt,
              }
            : item
        )
      );

      const { error: toggleError } = await supabase
        .from('grocery_items')
        .update({
          purchased: nextPurchased,
          purchased_at: nextPurchased ? new Date(nextPurchasedAt!).toISOString() : null,
        })
        .eq('id', id);

      if (toggleError) {
        setItems(previousItems);
        setError(toggleError.message);
      }
    },
    [items, user]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      if (!user) return;
      const previousItems = items;
      setError(null);
      setItems((prev) => prev.filter((item) => item.id !== id));

      const { error: deleteError } = await supabase
        .from('grocery_items')
        .delete()
        .eq('id', id);

      if (deleteError) {
        setItems(previousItems);
        setError(deleteError.message);
      }
    },
    [items, user]
  );

  const clearPurchased = useCallback(async () => {
    if (!user) return;
    const previousItems = items;
    setError(null);
    setItems((prev) => prev.filter((item) => !item.purchased));

    const { error: clearError } = await supabase
      .from('grocery_items')
      .delete()
      .eq('purchased', true);

    if (clearError) {
      setItems(previousItems);
      setError(clearError.message);
    }
  }, [items, user]);

  return {
    items,
    loading,
    error,
    needsSetup,
    theme,
    toggleTheme,
    refreshItems: fetchItems,
    addItem,
    updateItem,
    togglePurchased,
    deleteItem,
    clearPurchased,
  };
}
