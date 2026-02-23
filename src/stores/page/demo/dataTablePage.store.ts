import type { BasePageStore } from "@/stores/page/base.store.ts";
import { createTablePageStore } from "@/stores/page/base.store.ts";
import type { IDemoDataTableRow } from "@/interfaces/demo/IDemoDataTable.interface.ts";

export const useDataTablePageStore = createTablePageStore<IDemoDataTableRow>({
    persistKey: "demo-data-table-state",
    resetStorePartial: { page: 1 },
});

export type DemoDataTableState = BasePageStore<IDemoDataTableRow>;
