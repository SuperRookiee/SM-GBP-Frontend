import type { BasePageStore } from "@/stores/page/basePage.store";
import { createTablePageStore } from "@/stores/page/basePage.store";
import type { IDemoDataTableRow } from "@/interface/IDemoDataTable.interface";

export const useDemoDataTableStore = createTablePageStore<IDemoDataTableRow>({
    persistKey: "demo-data-table-state",
    resetStorePartial: { page: 1 },
});

export type DemoDataTableState = BasePageStore<IDemoDataTableRow>;
