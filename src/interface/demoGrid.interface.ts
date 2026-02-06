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

export interface DemoGridSampleDataParams {
  page: number;
  pageSize: number;
  query?: string;
  filterKey?: "all" | keyof IDemoGridRow;
  sortKey?: keyof IDemoGridRow | null;
  sortDirection?: "asc" | "desc";
}
