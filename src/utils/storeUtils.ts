import type { StoreApi } from "zustand";

type SetState<T> = StoreApi<T>["setState"];
type GetState<T> = StoreApi<T>["getState"];

// 변경된 값이 있을 때만 set 수행
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

// 상태가 변경된 경우에만 초기화
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

type HasChangedOptions<T extends Record<string, unknown>> = {
    excludeKeys?: (keyof T)[];
    includeKeys?: (keyof T)[];
    comparators?: Partial<{ [K in keyof T]: (a: T[K], b: T[K]) => boolean }>;
};

// 스토어가 기본값에서 변경되었는지 확인
export const hasChanged = <T extends Record<string, unknown>>(
    state: T,
    defaults: T,
    options: HasChangedOptions<T> = {}
) => {
    const { excludeKeys = [], includeKeys } = options;
    const comparators: NonNullable<HasChangedOptions<T>["comparators"]> =
        options.comparators ?? {};

    const keys = (includeKeys ?? (Object.keys(defaults) as (keyof T)[])).filter(
        (key) => !excludeKeys.includes(key)
    );

    for (const key of keys) {
        const comparator = comparators[key];
        const isEqual = comparator
            ? comparator(state[key], defaults[key])
            : Object.is(state[key], defaults[key]);

        if (!isEqual) return true;
    }

    return false;
};

// page를 기본값으로 리셋하면서 업데이트
export const createSetWithPageReset = <T extends { page: number }>(
    setIfChanged: (partial: Partial<T>) => void,
    page = 1
) => {
    return (partial: Partial<T>) =>
        setIfChanged({ ...partial, page });
};

type CreateStoreHelpersOptions<T, Snapshot extends Record<string, unknown>> = {
    set: SetState<T>;
    get: GetState<T>;
    initialState: Partial<T>;
    snapshot: (state: Partial<T>) => Snapshot;
    comparators?: Partial<{ [K in keyof Snapshot]: (a: Snapshot[K], b: Snapshot[K]) => boolean }>;
    resetStorePartial?: Partial<T>;
};

export const createStoreHelpers = <T, Snapshot extends Record<string, unknown>>({
    set,
    get,
    initialState,
    snapshot,
    comparators,
    resetStorePartial,
}: CreateStoreHelpersOptions<T, Snapshot>) => {
    const setIfChanged = createSetIfChanged<T>(set, get);
    const defaults = snapshot(initialState);
    const hasStateChanged = () => hasChanged<Snapshot>(snapshot(get()), defaults, { comparators });
    const reset = createResetIfDirty(set, get, initialState, hasStateChanged);
    const resetStore = () => {
        if (!resetStorePartial) return;
        setIfChanged(resetStorePartial);
    };

    return {
        setIfChanged,
        reset,
        resetStore,
    };
};

type CreatePageStoreHelpersOptions<T extends { page: number }, Snapshot extends Record<string, unknown>> =
    CreateStoreHelpersOptions<T, Snapshot> & { pageResetValue?: number };

export const createPageStoreHelpers = <T extends { page: number }, Snapshot extends Record<string, unknown>>({
    pageResetValue = 1,
    ...options
}: CreatePageStoreHelpersOptions<T, Snapshot>) => {
    const base = createStoreHelpers<T, Snapshot>(options);
    const setWithPageReset = createSetWithPageReset(base.setIfChanged, pageResetValue);

    return {
        ...base,
        setWithPageReset,
    };
};
