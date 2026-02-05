import { create } from "zustand";
import { devtool } from "@/utils/devtools.ts";
import type { User } from "@/types/User.ts";

type UserState = {
    user: User | null;
    isInitialized: boolean;
    setUser: (user: User) => void;
    clearUser: () => void;
    setInitialized: (initialized: boolean) => void;
};

export const useUserStore = create<UserState>()(devtool((set) => ({
    user: null,
    isInitialized: false,
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null }),
    setInitialized: (initialized) => set({ isInitialized: initialized }),
})));

// selector
export const useIsAuthenticated  = () => useUserStore(s => !!s.user);
