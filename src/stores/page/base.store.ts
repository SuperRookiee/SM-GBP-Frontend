import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_TABLE } from "@/constants/table.constants.tsx";
import { devtool } from "@/utils/devtools";
import { canonicalizeQuery } from "@/utils/queryCanonicalize.ts";
import { createPageStoreHelpers } from "@/utils/storeUtils";

export type BasePageStore<T extends object> = {
    query: string;
    filterKey: "all" | keyof T;
    sortKey: keyof T | null;
    sortDirection: "asc" | "desc";
    page: number;
    pageSize: number;
    setQuery: (query: string) => void;
    setFilterKey: (filterKey: "all" | keyof T) => void;
    setSort: (key: keyof T) => void;
    setPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;
    reset: () => void;
    resetStore: () => void;
};

type BasePageState<T extends object> = Pick<
    BasePageStore<T>,
    "query" | "filterKey" | "sortKey" | "sortDirection" | "page" | "pageSize"
>;

type CreateTablePageStoreOptions<T extends object> = {
    persistKey: string;
    initialState?: Partial<BasePageState<T>>;
    resetStorePartial?: Partial<BasePageState<T>>;
    pageResetValue?: number;
};

const defaultState = {
    query: "",
    filterKey: "all" as const,
    sortKey: null,
    sortDirection: "asc" as const,
    page: 1,
    pageSize: DEFAULT_TABLE.pageSize,
};

export const createTablePageStore = <T extends object>({
   persistKey, initialState, resetStorePartial, pageResetValue
}: CreateTablePageStoreOptions<T>) => {
    const resolvedInitialState = { ...defaultState, ...(initialState ?? {}) } as BasePageState<T>;

    return create<BasePageStore<T>>()(devtool(persist(
        (set, get) => {
            const { setIfChanged, setWithPageReset, reset, resetStore } = createPageStoreHelpers<BasePageStore<T>, BasePageState<T>>({
                set,
                get,
                initialState: resolvedInitialState,
                snapshot: state => ({
                    query: state.query ?? "",
                    filterKey: state.filterKey ?? "all",
                    sortKey: state.sortKey ?? null,
                    sortDirection: state.sortDirection ?? "asc",
                    page: state.page ?? 1,
                    pageSize: state.pageSize ?? DEFAULT_TABLE.pageSize,
                }),
                comparators: {
                    query: (current, defaults) =>
                        canonicalizeQuery(current) === canonicalizeQuery(defaults),
                },
                resetStorePartial,
                pageResetValue,
            });

            return {
                ...resolvedInitialState,
                setQuery: query => setWithPageReset({ query }),
                setFilterKey: filterKey => setWithPageReset({ filterKey }),
                setSort: key => {
                    const { sortKey, sortDirection } = get();
                    const nextSortDirection: BasePageStore<T>["sortDirection"] = sortDirection === "asc" ? "desc" : "asc";
                    const next: Partial<BasePageStore<T>> = sortKey === key ? { sortDirection: nextSortDirection } : {
                        sortKey: key,  sortDirection: "asc"
                    };
                    setWithPageReset(next);
                },
                setPage: page => setIfChanged({ page }),
                setPageSize: pageSize => setWithPageReset({ pageSize }),
                reset,
                resetStore,
            };
        },
        {
            name: persistKey,
            partialize: state => ({
                query: state.query,
                filterKey: state.filterKey,
                sortKey: state.sortKey,
                sortDirection: state.sortDirection,
                page: state.page,
                pageSize: state.pageSize,
            }),
        }
    )));
};
