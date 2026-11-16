import { useCallback, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      return { error: error.message };
    }
    return { user: data.user };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const trimmedName = displayName?.trim();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: trimmedName
          ? {
              data: {
                full_name: trimmedName,
              },
            }
          : undefined,
      });

      if (error) {
        return { error: error.message };
      }

      return {
        user: data.user,
        needsEmailConfirmation: Boolean(data.user && !data.session),
      };
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const user: User | null = session?.user ?? null;

  return {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
