import type { BasePageStore } from "@/stores/page/basePage.store";
import { createTablePageStore } from "@/stores/page/basePage.store";
import type { IUser } from "@/interface/IUser.ts";

export const useUserPageStore = createTablePageStore<IUser>({
    persistKey: "user-page-state",
});

export type UserPageState = BasePageStore<IUser>;
