import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GridRow } from "@/interface/grid.interface";
import { devtool } from "@/utils/devtools";
import { createResetIfDirty, createSetIfChanged, createSetWithPageReset } from "@/utils/storeUtils";
import { hasChanged } from "@/stores/hasChanged";

type GridState = {
    data: GridRow[];
    query: string;
    filterKey: "all" | keyof GridRow;
    sortKey: keyof GridRow | null;
    sortDirection: "asc" | "desc";
    page: number;
    setData: (data: GridRow[]) => void;
    setQuery: (query: string) => void;
    setFilterKey: (filterKey: "all" | keyof GridRow) => void;
    setSort: (key: keyof GridRow) => void;
    setPage: (page: number) => void;
    reset: () => void;
    resetStore: () => void;
};

// 초기 상태 값
const initialState = {
    data: [],
    query: "",
    filterKey: "all" as const,
    sortKey: null,
    sortDirection: "asc" as const,
    page: 1,
};

type GridStateSnapshot = Pick<GridState, "data" | "query" | "filterKey" | "sortKey" | "page">;

const gridDefaults: GridStateSnapshot = {
    data: [],
    query: "",
    filterKey: "all",
    sortKey: null,
    page: 1,
};

// 스토어가 기본값에서 변경되었는지 확인하는 함수
const hasGridState = (state: GridState) =>
    hasChanged<GridStateSnapshot>({
        data: state.data,
        query: state.query,
        filterKey: state.filterKey,
        sortKey: state.sortKey,
        page: state.page,
    }, gridDefaults, {
        comparators: {
            data: (current, defaults) => current.length === defaults.length,
            query: (current, defaults) => current.trim() === defaults.trim(),
        },
    });

// Grid 상태를 전역으로 관리하는 스토어 함수
export const useGridStore = create<GridState>()(devtool(persist((set, get) => {
    // #. 공통: 변경 없으면 set 생략하는 헬퍼
    const setIfChanged = createSetIfChanged<GridState>(set, get);
    // #. 공통: page를 1로 리셋하면서 업데이트 (변경 없으면 set 생략)
    const setWithPageReset = createSetWithPageReset<GridState>(setIfChanged, 1);
    // #. 공통: 초기화 (변경 없으면 set 생략)
    const resetIfDirty = createResetIfDirty(set, get, initialState, hasGridState);

    return {
        ...initialState,
        // 데이터 목록 갱신 핸들러 함수
        setData: (data) => setIfChanged({ data }),
        // 검색어 업데이트 핸들러 함수
        setQuery: (query) => setWithPageReset({ query }),
        // 필터 키 업데이트 핸들러 함수
        setFilterKey: (filterKey) => setWithPageReset({ filterKey }),
        // 정렬 기준 토글/변경 핸들러 함수
        setSort: (key) => {
            const { sortKey, sortDirection } = get();
            const nextSortDirection: GridState["sortDirection"] = sortDirection === "asc" ? "desc" : "asc";
            const next: Partial<GridState> =
                sortKey === key ? { sortDirection: nextSortDirection } : { sortKey: key, sortDirection: "asc" };
            setWithPageReset(next);
        },
        // 페이지 번호 설정 핸들러 함수
        setPage: (page) => setIfChanged({ page }),
        // 초기 상태로 되돌리기 핸들러 함수
        reset: resetIfDirty,
        // 변경된 상태가 있을 때만 초기화 핸들러 함수
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
    }),
})));
