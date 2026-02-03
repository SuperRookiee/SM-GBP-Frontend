/**
 * Grid 테이블에서 사용하는 행 데이터 타입
 */
export interface GridRow {
  id: string;
  customer: string;
  email: string;
  role: string;
  status: string;
}

/**
 * Grid 테이블 상태 및 액션 타입
 */
export interface GridState {
  data: GridRow[];
  query: string;
  filterKey: "all" | keyof GridRow;
  sortKey: keyof GridRow | null;
  sortDirection: "asc" | "desc";
  page: number;
  // 상태 변경용 액션
  setData: (data: GridRow[]) => void;
  setQuery: (query: string) => void;
  setFilterKey: (filterKey: "all" | keyof GridRow) => void;
  setSort: (key: keyof GridRow) => void;
  setPage: (page: number) => void;
  reset: () => void;
  resetStore: () => void;
}
