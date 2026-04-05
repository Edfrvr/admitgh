"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useProfile } from "./useProfile";
import type { Profile } from "./types";

interface ProfileContextValue {
  profile: Profile;
  setProfile: (updater: Profile | ((prev: Profile) => Profile)) => void;
  isLoaded: boolean;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const value = useProfile();
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfileContext(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfileContext must be used inside <ProfileProvider>");
  return ctx;
}
