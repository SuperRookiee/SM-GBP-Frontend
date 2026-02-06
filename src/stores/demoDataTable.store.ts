import { create } from "zustand";
import { persist } from "zustand/middleware";
import { devtool } from "@/utils/devtools";
import { canonicalizeQuery } from "@/utils/queryCanonicalize.ts";
import { createResetIfDirty, createSetIfChanged, createSetWithPageReset, hasChanged } from "@/utils/storeUtils";
import type { IDemoDataTableRow } from "@/interface/IDemoDataTable.interface.ts";

type DemoDataTableState = {
    data: IDemoDataTableRow[];
    query: string;
    filterKey: "all" | keyof IDemoDataTableRow;
    sortKey: keyof IDemoDataTableRow | null;
    sortDirection: "asc" | "desc";
    page: number;
    setData: (data: IDemoDataTableRow[]) => void;
    setQuery: (query: string) => void;
    setFilterKey: (filterKey: "all" | keyof IDemoDataTableRow) => void;
    setSort: (key: keyof IDemoDataTableRow) => void;
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

type DemoDataTableStateSnapshot = Pick<DemoDataTableState, "data" | "query" | "filterKey" | "sortKey" | "page">;

const demoDataTableDefaults: DemoDataTableStateSnapshot = {
    data: [],
    query: "",
    filterKey: "all",
    sortKey: null,
    page: 1,
};

// 스토어가 기본값에서 변경되었는지 확인하는 함수
const hasDemoDataTableState = (state: DemoDataTableState) => hasChanged<DemoDataTableStateSnapshot>(
    {
        data: state.data,
        query: state.query,
        filterKey: state.filterKey,
        sortKey: state.sortKey,
        page: state.page,
    },
    demoDataTableDefaults,
    {
        comparators: {
            data: (current, defaults) => current.length === defaults.length,
            query: (current, defaults) => canonicalizeQuery(current) === canonicalizeQuery(defaults),
        }
    }
);

// Grid 상태를 전역으로 관리하는 스토어 함수
export const useDemoDataTableStore = create<DemoDataTableState>()(devtool(persist((set, get) => {
    // #. 공통: 변경 없으면 set 생략하는 헬퍼
    const setIfChanged = createSetIfChanged<DemoDataTableState>(set, get);
    // #. 공통: page를 1로 리셋하면서 업데이트 (변경 없으면 set 생략)
    const setWithPageReset = createSetWithPageReset<DemoDataTableState>(setIfChanged, 1);
    // #. 공통: 초기화 (변경 없으면 set 생략)
    const resetIfDirty = createResetIfDirty(set, get, initialState, hasDemoDataTableState);

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
            const nextSortDirection: DemoDataTableState["sortDirection"] = sortDirection === "asc" ? "desc" : "asc";
            const next: Partial<DemoDataTableState> =
                sortKey === key ? { sortDirection: nextSortDirection } : { sortKey: key, sortDirection: "asc" };
            setWithPageReset(next);
        },
        // 페이지 번호 설정 핸들러 함수
        setPage: (page) => setIfChanged({ page }),
        // 초기 상태로 되돌리기 핸들러 함수
        reset: resetIfDirty,
        // 변경된 상태가 있을 때만 초기화 핸들러 함수
        resetStore: () => setIfChanged({ data: [], page: 1 }),
    };
}, {
    name: "demo-data-table-state",
    partialize: (state) => ({
        query: state.query,
        filterKey: state.filterKey,
        sortKey: state.sortKey,
        sortDirection: state.sortDirection,
        page: state.page,
    }),
})));
