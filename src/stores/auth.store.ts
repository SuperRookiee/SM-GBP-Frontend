import { create } from "zustand";
import { persist } from "zustand/middleware";
import { devtool } from "@/utils/devtools.ts";
import { Role } from "@/enums/role.ts";
import type { IUser } from "@/interfaces/IUser.ts";

type AuthState = {
    user: IUser | null;
    setUser: (user: IUser) => void;
    clearUser: () => void;
};

// FIXME: 실제 인증 로직에 맞게 User 타입 및 상태 관리 로직 수정 필요
export const useAuthStore = create<AuthState>()(devtool(persist((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null }),
}), {
    name: "user-state",
    partialize: (s) => ({ user: s.user }),
})));

/**
 * Selector 및 convenience hooks
 */
// 로그인 여부
export const useIsAuthenticated = () => useAuthStore(state => !!state.user);
// 현재 유저 role
export const useUserRole = () => useAuthStore(state => state.user?.role ?? null);
// 특정 role 여부
export const useHasRole = (role: Role) => useAuthStore(state => state.user?.role === role);
// role별 convenience hooks
export const useIsAdmin = () => useHasRole(Role.ADMIN);
export const useIsUser = () => useHasRole(Role.USER);
export const useIsGuest = () => useHasRole(Role.GUEST);