'use client';

import { useMemo } from 'react';
import { useSession } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

export function useSupabaseClient() {
  const { session } = useSession();

  const supabaseClient = useMemo(() => {
    if (!session) return null;
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!,
      {
        global: {
          fetch: async (url, options = {}) => {
            const clerkToken = await session.getToken({
              template: 'supabase',
            });

            const headers = new Headers(options?.headers);
            headers.set('Authorization', `Bearer ${clerkToken}`);

            return fetch(url, {
              ...options,
              headers,
            });
          },
        },
      }
    );
  }, [session]);

  return supabaseClient;
}