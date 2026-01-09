export interface GridRow {
  id: string;
  customer: string;
  email: string;
  role: string;
  status: string;
}

export interface GridState {
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
}
