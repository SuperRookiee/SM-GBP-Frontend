/**
 * Grid 테이블에서 사용하는 행 데이터 타입
 */
export interface IDemoDataTableRow {
  id: string;
  customer: string;
  email: string;
  role: string;
  status: string;
}

export interface IDemoDataTableSampleDataParams {
  page: number;
  pageSize: number;
  query?: string;
  filterKey?: "all" | keyof IDemoDataTableRow;
  sortKey?: keyof IDemoDataTableRow | null;
  sortDirection?: "asc" | "desc";
}
