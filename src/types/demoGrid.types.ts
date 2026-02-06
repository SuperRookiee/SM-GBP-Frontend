import type { ReactNode } from "react";
import type { IDemoGridRow } from "@/interface/IDemoGrid.interface.ts";

export type DemoGridColumn<T = IDemoGridRow> = {
  key: keyof T;
  label: string;
  sortable?: boolean;
  headerClassName?: string;
  cellClassName?: string;
  render?: (row: T) => ReactNode;
};

export type DemoGridFilterOption<T = IDemoGridRow> = {
  value: "all" | keyof T;
  label: string;
};

export type DemoGridResponse = {
  rows: IDemoGridRow[];
  total: number;
};
