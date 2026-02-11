import { create } from "zustand";
import { devtool } from "@/utils/devtools.ts";
import type { IDemoGridSortOption } from "@/interface/IDemoGridTable.interface.ts";

type GridTablePageState = {
  keyword: string;
  dateFrom?: string;
  dateTo?: string;
  includeDiscontinued: boolean;
  sorters: IDemoGridSortOption[];
  setKeyword: (keyword: string) => void;
  setDateFrom: (dateFrom?: string) => void;
  setDateTo: (dateTo?: string) => void;
  setIncludeDiscontinued: (includeDiscontinued: boolean) => void;
  setSorters: (sorters: IDemoGridSortOption[]) => void;
  resetFilters: () => void;
};

const initialState = {
  keyword: "",
  dateFrom: "",
  dateTo: "",
  includeDiscontinued: true,
  sorters: [] as IDemoGridSortOption[],
};

export const useGridTablePageStore = create<GridTablePageState>()(
  devtool((set) => ({
    ...initialState,
    setKeyword: (keyword) => set({ keyword }),
    setDateFrom: (dateFrom) => set({ dateFrom }),
    setDateTo: (dateTo) => set({ dateTo }),
    setIncludeDiscontinued: (includeDiscontinued) => set({ includeDiscontinued }),
    setSorters: (sorters) => set({ sorters }),
    resetFilters: () => set({ ...initialState }),
  })),
);
