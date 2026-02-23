import type { ReactNode } from "react";
import type { IUser } from "@/interfaces/IUser.ts";

export type UserColumn<T = IUser> = {
  key: keyof T;
  label: string;
  width?: string | number;
  sortable?: boolean;
  filterable?: boolean;
  headerClassName?: string;
  cellClassName?: string;
  render?: (row: T) => ReactNode;
};

export type UserFilterOption<T = IUser> = {
  value: "all" | keyof T;
  label: string;
};

