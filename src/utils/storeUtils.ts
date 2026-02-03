import type { StoreApi } from "zustand";

type SetState<T> = StoreApi<T>["setState"];
type GetState<T> = StoreApi<T>["getState"];

/**
 * 변경된 값이 있을 때만 set 수행
 */
export const createSetIfChanged = <T>(
    set: SetState<T>,
    get: GetState<T>
) => {
    return (partial: Partial<T>) => {
        const state = get();
        for (const key in partial) {
            const k = key as keyof T;
            if (!Object.is(state[k], partial[k])) {
                set(partial);
                return;
            }
        }
    };
};

/**
 * 상태가 변경된 경우에만 초기화
 */
export const createResetIfDirty = <T, I extends Partial<T>>(
    set: SetState<T>,
    get: GetState<T>,
    initialState: I,
    hasState: (state: T) => boolean
) => {
    return () => {
        if (!hasState(get())) return;
        set({ ...(initialState as Partial<T>) });
    };
};

/**
 * page를 기본값으로 리셋하면서 업데이트
 */
export const createSetWithPageReset = <T extends { page: number }>(
    setIfChanged: (partial: Partial<T>) => void,
    page = 1
) => {
    return (partial: Partial<T>) =>
        setIfChanged({ ...partial, page });
};

/**
 * 선택 사항: set/get 기반 유틸을 한 번에 묶고 싶을 때
 * (강제 아님)
 */
export const createStoreCtx = <T, I extends Partial<T>>(
    set: SetState<T>,
    get: GetState<T>,
    initialState: I,
    hasState: (state: T) => boolean
) => {
    const setIfChanged = createSetIfChanged<T>(set, get);

    return {
        setIfChanged,
        resetIfDirty: createResetIfDirty<T, I>(
            set,
            get,
            initialState,
            hasState
        ),
    };
};