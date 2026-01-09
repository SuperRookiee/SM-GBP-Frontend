import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { GridState } from "@/interface/grid.interface";

const initialState = {
  data: [],
  query: "",
  filterKey: "all" as const,
  sortKey: null,
  sortDirection: "asc" as const,
  page: 1,
};

const hasGridState = (state: GridState) =>
  state.data.length > 0 ||
  state.query.trim().length > 0 ||
  state.filterKey !== "all" ||
  state.sortKey !== null ||
  state.page !== 1;

export const useGridStore = create<GridState>()(
  persist(
    (set) => ({
      ...initialState,
      setData: (data) => set({ data }),
      setQuery: (query) => set({ query, page: 1 }),
      setFilterKey: (filterKey) => set({ filterKey, page: 1 }),
      setSort: (key) =>
        set((state) => {
          if (state.sortKey === key) {
            return {
              sortDirection: state.sortDirection === "asc" ? "desc" : "asc",
              page: 1,
            };
          }

          return { sortKey: key, sortDirection: "asc", page: 1 };
        }),
      setPage: (page) => set({ page }),
      reset: () => set({ ...initialState }),
      resetStore: () =>
        set((state) => (hasGridState(state) ? { ...initialState } : state)),
    }),
    {
      name: "grid-state",
      partialize: (state) => ({
        query: state.query,
        filterKey: state.filterKey,
        sortKey: state.sortKey,
        sortDirection: state.sortDirection,
        page: state.page,
      }),
    },
  ),
);
