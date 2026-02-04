/**
 * Grid 테이블에서 사용하는 행 데이터 타입
 */
export interface DemoGridRow {
  id: string;
  customer: string;
  email: string;
  role: string;
  status: string;
}

export type DemoGridColumn<T = DemoGridRow> = {
  key: keyof T;
  label: string;
  sortable?: boolean;
  headerClassName?: string;
  cellClassName?: string;
  render?: (row: T) => React.ReactNode;
};

export type DemoGridFilterOption<T = DemoGridRow> = {
  value: "all" | keyof T;
  label: string;
};
