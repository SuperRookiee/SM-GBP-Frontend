import type { ReactNode } from "react";
import type { IDemoDataTableRow } from "@/interfaces/demo/IDemoDataTable.interface.ts";

export type DemoDataTableColumn<T = IDemoDataTableRow> = {
  key: keyof T | string;
  label: string;
  width?: string | number;
  sortable?: boolean;
  filterable?: boolean;
  headerClassName?: string;
  cellClassName?: string;
  render?: (row: T) => ReactNode;
};

export type DemoDataTableFilterOption<T = IDemoDataTableRow> = {
  value: "all" | keyof T;
  label: string;
};

export type DemoDataTableResponse = {
  rows: IDemoDataTableRow[];
  total: number;
};

