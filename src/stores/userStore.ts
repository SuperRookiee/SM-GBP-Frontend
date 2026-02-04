import { create } from "zustand";
import { persist } from "zustand/middleware";
import { devtool } from "@/utils/devtools.ts";
import type { User } from "@/types/User.ts";

type UserState = {
    user: User | null;
    setUser: (user: User) => void;
    clearUser: () => void;
};

export const useUserStore = create<UserState>()(devtool(persist((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null }),
}), {
    name: "user-state",
    partialize: (s) => ({ user: s.user }),
})));

// selector
export const useIsAuthenticated  = () => useUserStore(s => !!s.user);