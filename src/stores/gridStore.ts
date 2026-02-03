import { create } from "zustand";
import { persist } from "zustand/middleware";
import { withDevtools } from "@/utils/devtools.ts";
import type { GridState } from "@/interface/grid.interface";
import { createResetIfDirty, createSetIfChanged } from "@/stores/storeUtils";

// Grid 스토어 초기 상태 값입니다.
const initialState = {
    data: [],
    query: "",
    filterKey: "all" as const,
    sortKey: null,
    sortDirection: "asc" as const,
    page: 1,
};

// 스토어가 기본값에서 변경되었는지 확인하는 함수
const hasGridState = (state: GridState) =>
    state.data.length > 0 ||
    state.query.trim().length > 0 ||
    state.filterKey !== "all" ||
    state.sortKey !== null ||
    state.page !== 1;

// Grid 상태를 전역으로 관리하는 스토어 함수
export const useGridStore = create<GridState>()(withDevtools(persist((set, get) => {
    // 공통: 변경 없으면 set 생략하는 헬퍼
    const setIfChanged = createSetIfChanged<GridState>(set, get);

    // 공통: page를 1로 리셋하면서 업데이트 (변경 없으면 set 생략)
    const setWithPageReset = (partial: Partial<GridState>) => setIfChanged({ ...partial, page: 1 });

    // 공통: 초기화 (변경 없으면 set 생략)
    const resetIfDirty = createResetIfDirty(set, get, initialState, hasGridState);

    return {
        ...initialState,
        // #. 데이터 목록 갱신 핸들러 함수
        setData: (data) => setIfChanged({ data }),
        // #. 검색어 업데이트 핸들러 함수
        setQuery: (query) => setWithPageReset({ query }),
        // #. 필터 키 업데이트 핸들러 함수
        setFilterKey: (filterKey) => setWithPageReset({ filterKey }),
        // #. 정렬 기준 토글/변경 핸들러 함수
        setSort: (key) => {
            const { sortKey, sortDirection } = get();
            const nextSortDirection: "asc" | "desc" =
                sortDirection === "asc" ? "desc" : "asc";
            const next: Partial<GridState> =
                sortKey === key
                    ? { sortDirection: nextSortDirection }
                    : { sortKey: key, sortDirection: "asc" };
            setWithPageReset(next);
        },
        // #. 페이지 번호 설정 핸들러 함수
        setPage: (page) => setIfChanged({ page }),
        // #. 초기 상태로 되돌리기 핸들러 함수
        reset: resetIfDirty,
        // #. 변경된 상태가 있을 때만 초기화 핸들러 함수
        resetStore: resetIfDirty,
    };
}, {
    name: "grid-state",
    // 필요한 필드만 localStorage에 저장합니다.
    partialize: (state) => ({
        query: state.query,
        filterKey: state.filterKey,
        sortKey: state.sortKey,
        sortDirection: state.sortDirection,
        page: state.page,
    })
})));
