/**
 * Grid 테이블에서 사용하는 행 데이터 타입
 */
export interface IDemoGridRow {
  id: string;
  customer: string;
  email: string;
  role: string;
  status: string;
}

export type DemoGridColumn<T = IDemoGridRow> = {
  key: keyof T;
  label: string;
  sortable?: boolean;
  headerClassName?: string;
  cellClassName?: string;
  render?: (row: T) => React.ReactNode;
};

export type DemoGridFilterOption<T = IDemoGridRow> = {
  value: "all" | keyof T;
  label: string;
};

export type DemoGridResponse = {
  rows: IDemoGridRow[];
  total: number;
};

export interface DemoGridSampleDataParams {
  page: number;
  pageSize: number;
  query?: string;
  filterKey?: "all" | keyof IDemoGridRow;
  sortKey?: keyof IDemoGridRow | null;
  sortDirection?: "asc" | "desc";
}
