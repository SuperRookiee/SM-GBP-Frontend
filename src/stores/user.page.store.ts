import { create } from "zustand";
import { persist } from "zustand/middleware";
import { devtool } from "@/utils/devtools";
import { canonicalizeQuery } from "@/utils/queryCanonicalize.ts";
import { createPageStoreHelpers } from "@/utils/storeUtils";
import type { IUser } from "@/interface/IUser.ts";

type UserPageState = {
    query: string;
    filterKey: "all" | keyof IUser;
    sortKey: keyof IUser | null;
    sortDirection: "asc" | "desc";
    page: number;
    setQuery: (query: string) => void;
    setFilterKey: (filterKey: "all" | keyof IUser) => void;
    setSort: (key: keyof IUser) => void;
    setPage: (page: number) => void;
    reset: () => void;
};

const initialState = {
    query: "",
    filterKey: "all" as const,
    sortKey: null,
    sortDirection: "asc" as const,
    page: 1,
};

export const useUserPageStore = create<UserPageState>()(devtool(persist((set, get) => {
    const { setIfChanged, setWithPageReset, reset } = createPageStoreHelpers<
        UserPageState,
        Pick<UserPageState, "query" | "filterKey" | "sortKey" | "page">
    >({
        set,
        get,
        initialState,
        snapshot: (state) => ({
            query: state.query ?? "",
            filterKey: state.filterKey ?? "all",
            sortKey: state.sortKey ?? null,
            page: state.page ?? 1,
        }),
        comparators: {
            query: (current, defaults) => canonicalizeQuery(current) === canonicalizeQuery(defaults),
        },
    });

    return {
        ...initialState,
        setQuery: (query) => setWithPageReset({ query }),
        setFilterKey: (filterKey) => setWithPageReset({ filterKey }),
        setSort: (key) => {
            const { sortKey, sortDirection } = get();
            const nextSortDirection: UserPageState["sortDirection"] = sortDirection === "asc" ? "desc" : "asc";
            const next: Partial<UserPageState> =
                sortKey === key ? { sortDirection: nextSortDirection } : { sortKey: key, sortDirection: "asc" };
            setWithPageReset(next);
        },
        setPage: (page) => setIfChanged({ page }),
        reset,
    };
}, {
    name: "user-page-state",
    partialize: (state) => ({
        query: state.query,
        filterKey: state.filterKey,
        sortKey: state.sortKey,
        sortDirection: state.sortDirection,
        page: state.page,
    }),
})));
