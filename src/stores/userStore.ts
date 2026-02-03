// src/stores/userStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { devtool } from "@/utils/devtools";
import { createResetIfDirty, createSetIfChanged } from "@/utils/storeUtils";
import { hasChanged } from "@/stores/hasChanged";

export type User = {
    id: string;
    name: string;
    role?: string;
};

type UserState = {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User) => void;
    clearUser: () => void;
    reset: () => void;
    resetStore: () => void;
};

// 초기 상태 값
const initialState = {
    user: null,
    isAuthenticated: false,
};

type UserStateSnapshot = Pick<UserState, "user" | "isAuthenticated">;

const userDefaults: UserStateSnapshot = {
    user: null,
    isAuthenticated: false,
};

// 스토어가 기본값에서 변경되었는지 확인
const hasUserState = (state: UserState) =>
    hasChanged<UserStateSnapshot>({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
    }, userDefaults);

// User 상태를 전역으로 관리하는 스토어 함수
export const useUserStore = create<UserState>()(
    devtool(
        persist((set, get) => {
            // #. 공통: 변경 없으면 set 생략하는 헬퍼
            const setIfChanged = createSetIfChanged<UserState>(set, get);
            // #. 공통: 초기화 (변경 없으면 set 생략)
            const resetIfDirty = createResetIfDirty(set, get, initialState, hasUserState);

            return {
                ...initialState,
                // #. 로그인 성공 후 사용자 정보 설정
                setUser: (user) => setIfChanged({ user, isAuthenticated: true }),
                // #. 로그아웃 처리
                clearUser: () => setIfChanged(initialState),
                // #. 초기 상태로 되돌리기 핸들러 함수
                reset: resetIfDirty,
                // #. 변경된 상태가 있을 때만 초기화 핸들러 함수
                resetStore: resetIfDirty,
            };
        }, {
            name: "user-state",
            // 필요한 필드만 localStorage에 저장합니다.
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                user: state.user,
            }),
        })
    )
);
