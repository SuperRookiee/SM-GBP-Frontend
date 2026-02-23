import type { BasePageStore } from "@/stores/page/base.store.ts";
import { createTablePageStore } from "@/stores/page/base.store.ts";
import type { ISampleRow } from "@/interfaces/demo/ISample.interface.ts";

export const useSamplePageStore = createTablePageStore<ISampleRow>({
    persistKey: "sample-data-table-state",
    resetStorePartial: { page: 1 },
});

export type SamplePageState = BasePageStore<ISampleRow>;

