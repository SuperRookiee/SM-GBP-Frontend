import type { IDemoDataTableRow } from "@/interface/IDemoDataTable.interface.ts";
import { BasePageStore, createTablePageStore } from "@/stores/basePage.store";

export type DemoDataTableState = BasePageStore<IDemoDataTableRow>;

export const useDemoDataTableStore = createTablePageStore<IDemoDataTableRow>({
    persistKey: "demo-data-table-state",
    resetStorePartial: { page: 1 },
});
