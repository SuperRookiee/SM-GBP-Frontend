import { create } from "zustand";
import { devtool } from "@/utils/devtools.ts";
import type { DemoGridCategory, DemoGridStatus, IDemoGridSortOption } from "@/interfaces/demo/IDemoGridTable.interface.ts";

type GridTableFilterState = {
  keyword: string;
  dateFrom?: string;
  dateTo?: string;
  includeDiscontinued: boolean;
  categories: DemoGridCategory[];
  statuses: DemoGridStatus[];
};

type GridTablePageState = {
  draft: GridTableFilterState;
  applied: GridTableFilterState;
  sorters: IDemoGridSortOption[];
  setDraftKeyword: (keyword: string) => void;
  setDraftDateFrom: (dateFrom?: string) => void;
  setDraftDateTo: (dateTo?: string) => void;
  setDraftIncludeDiscontinued: (includeDiscontinued: boolean) => void;
  setDraftCategories: (categories: DemoGridCategory[]) => void;
  setDraftStatuses: (statuses: DemoGridStatus[]) => void;
  setSorters: (sorters: IDemoGridSortOption[]) => void;
  applyFilters: () => void;
  resetFilters: () => void;
};

const initialFilterState: GridTableFilterState = {
    keyword: "",
    dateFrom: "",
    dateTo: "",
    includeDiscontinued: true,
    categories: [],
    statuses: [],
};

export const useGridTablePageStore = create<GridTablePageState>()(
    devtool((set, get) => ({
        draft: { ...initialFilterState },
        applied: { ...initialFilterState },
        sorters: [],
        setDraftKeyword: (keyword) => set((state) => ({ draft: { ...state.draft, keyword } })),
        setDraftDateFrom: (dateFrom) => set((state) => ({ draft: { ...state.draft, dateFrom } })),
        setDraftDateTo: (dateTo) => set((state) => ({ draft: { ...state.draft, dateTo } })),
        setDraftIncludeDiscontinued: (includeDiscontinued) => set((state) => ({ draft: { ...state.draft, includeDiscontinued } })),
        setDraftCategories: (categories) => set((state) => ({ draft: { ...state.draft, categories } })),
        setDraftStatuses: (statuses) => set((state) => ({ draft: { ...state.draft, statuses } })),
        setSorters: (sorters) => set({ sorters }),
        applyFilters: () => set({ applied: { ...get().draft } }),
        resetFilters: () => set({ draft: { ...initialFilterState }, applied: { ...initialFilterState }, sorters: [] }),
    })),
);

