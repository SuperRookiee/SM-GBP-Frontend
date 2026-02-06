import type { BasePageStore } from "@/stores/page/base.store.ts";
import { createTablePageStore } from "@/stores/page/base.store.ts";
import type { IDemoDataTableRow } from "@/interface/IDemoDataTable.interface";

export const useDemoDataTableStore = createTablePageStore<IDemoDataTableRow>({
    persistKey: "demo-data-table-state",
    resetStorePartial: { page: 1 },
});

export type DemoDataTableState = BasePageStore<IDemoDataTableRow>;
