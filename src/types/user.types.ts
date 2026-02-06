import type { ReactNode } from "react";
import type { IUserInterface } from "@/interface/IUser.interface";

export type UserColumn<T = IUserInterface> = {
  key: keyof T;
  label: string;
  sortable?: boolean;
  headerClassName?: string;
  cellClassName?: string;
  render?: (row: T) => ReactNode;
};

export type UserFilterOption<T = IUserInterface> = {
  value: "all" | keyof T;
  label: string;
};
