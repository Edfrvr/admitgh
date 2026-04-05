"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "./types";

const DEFAULT_PROFILE: Profile = {
  name: "",
  program: null,
  electives: [],
  grades: {},
  applied: {},
};

interface UseProfileReturn {
  profile: Profile;
  setProfile: (updater: Profile | ((prev: Profile) => Profile)) => void;
  isLoaded: boolean;
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfileState] = useState<Profile>(DEFAULT_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Lazily initialized in useEffect (browser-only) so SSR prerendering never
  // instantiates the Supabase browser client without the required env vars.
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const userIdRef = useRef<string | null>(null);

  function getSupabase(): ReturnType<typeof createClient> {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      const supabase = getSupabase();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) setIsLoaded(true);
        return;
      }

      userIdRef.current = user.id;

      const { data } = await supabase
        .from("profiles")
        .select("name, program, electives, grades, applied")
        .eq("id", user.id)
        .single();

      if (cancelled) return;

      if (data) {
        setProfileState({
          name: (data.name as string) ?? "",
          program: (data.program as string | null) ?? null,
          electives: (data.electives as string[]) ?? [],
          grades: (data.grades as Profile["grades"]) ?? {},
          applied: (data.applied as Profile["applied"]) ?? {},
        });
      }

      setIsLoaded(true);
    }

    void loadProfile();
    return () => {
      cancelled = true;
    };
    // getSupabase is stable (ref-backed) — safe to omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setProfile = useCallback(
    (updater: Profile | ((prev: Profile) => Profile)) => {
      setProfileState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;

        const userId = userIdRef.current;
        if (userId) {
          // Fire-and-forget upsert — UI updates immediately without waiting for the DB.
          // Idempotent, so React StrictMode double-invocations are harmless.
          void getSupabase().from("profiles").upsert({
            id: userId,
            name: next.name,
            program: next.program,
            electives: next.electives,
            grades: next.grades,
            applied: next.applied,
          });
        }

        return next;
      });
    },
    // getSupabase is stable (ref-backed) — safe to omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return { profile, setProfile, isLoaded };
}
