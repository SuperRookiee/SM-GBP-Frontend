type SetState<T> = (
    partial: Partial<T> | ((state: T) => Partial<T>),
    replace?: boolean
) => void;
type GetState<T> = () => T;

export const createSetIfChanged = <T>(set: SetState<T>, get: GetState<T>) => {
    return (partial: Partial<T>) => {
        const state = get();
        for (const key in partial) {
            if (!Object.is(state[key as keyof T], partial[key as keyof T])) {
                set(partial);
                return;
            }
        }
    };
};

export const createResetIfDirty = <T, I extends Partial<T>>(
    set: SetState<T>,
    get: GetState<T>,
    initialState: I,
    isDirty?: (state: T) => boolean
) => {
    return () => {
        const state = get();
        const dirty = isDirty
            ? isDirty(state)
            : Object.keys(initialState).some((key) => {
                const typedKey = key as keyof T;
                return !Object.is(state[typedKey], initialState[key as keyof I]);
            });
        if (!dirty) return;
        set({ ...(initialState as Partial<T>) });
    };
};
