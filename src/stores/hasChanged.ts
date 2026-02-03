export type HasChangedOptions<T extends Record<string, any>> = {
    excludeKeys?: (keyof T)[];
    includeKeys?: (keyof T)[];
    comparators?: Partial<Record<keyof T, (a: T[keyof T], b: T[keyof T]) => boolean>>;
};

export const hasChanged = <T extends Record<string, any>>(
    state: T,
    defaults: T,
    options: HasChangedOptions<T> = {}
) => {
    const { excludeKeys = [], includeKeys, comparators = {} } = options;
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

/**
 * Example checks (no test runner configured):
 * - const defaults = { count: 0, query: "" };
 * - hasChanged({ count: 1, query: "" }, defaults) === true
 * - hasChanged({ count: 0, query: "  " }, defaults, {
 *     comparators: { query: (a, b) => a.trim() === b.trim() },
 *   }) === false
 *
 * Grid store example:
 * - const gridDefaults = { data: [], query: "", filterKey: "all", sortKey: null, page: 1 };
 * - hasChanged({ ...gridDefaults, data: [{ id: 1 }] }, gridDefaults, {
 *     comparators: { data: (a, b) => a.length === b.length, query: (a, b) => a.trim() === b.trim() },
 *   }) === true
 *
 * User store example:
 * - const userDefaults = { user: null, isAuthenticated: false };
 * - hasChanged({ user: { id: "1", name: "Test" }, isAuthenticated: true }, userDefaults) === true
 */
