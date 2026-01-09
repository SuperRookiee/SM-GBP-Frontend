import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { GridState } from "@/interface/grid.interface";

// Grid 스토어 초기 상태 값입니다.
const initialState = {
  data: [],
  query: "",
  filterKey: "all" as const,
  sortKey: null,
  sortDirection: "asc" as const,
  page: 1,
};

// 스토어가 기본값에서 변경되었는지 확인합니다.
const hasGridState = (state: GridState) =>
  state.data.length > 0 ||
  state.query.trim().length > 0 ||
  state.filterKey !== "all" ||
  state.sortKey !== null ||
  state.page !== 1;

// Grid 상태를 전역으로 관리하는 zustand 스토어입니다.
export const useGridStore = create<GridState>()(
  persist(
    (set) => ({
      ...initialState,
      // 데이터 목록을 갱신합니다.
      setData: (data) => set({ data }),
      // 검색어를 업데이트하고 페이지를 초기화합니다.
      setQuery: (query) => set({ query, page: 1 }),
      // 필터 키를 업데이트하고 페이지를 초기화합니다.
      setFilterKey: (filterKey) => set({ filterKey, page: 1 }),
      // 정렬 기준을 토글하거나 변경합니다.
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
      // 페이지 번호를 설정합니다.
      setPage: (page) => set({ page }),
      // 강제로 초기 상태로 되돌립니다.
      reset: () => set({ ...initialState }),
      // 변경된 상태가 있을 때만 초기화합니다.
      resetStore: () =>
        set((state) => (hasGridState(state) ? { ...initialState } : state)),
    }),
    {
      name: "grid-state",
      // 필요한 필드만 localStorage에 저장합니다.
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
