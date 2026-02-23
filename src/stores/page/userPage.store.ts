import type { BasePageStore } from "@/stores/page/base.store.ts";
import { createTablePageStore } from "@/stores/page/base.store.ts";
import type { IUser } from "@/interfaces/IUser.ts";

export const useUserPageStore = createTablePageStore<IUser>({
    persistKey: "user-page-state",
});

export type UserPageState = BasePageStore<IUser>;

