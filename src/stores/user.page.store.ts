import type { IUser } from "@/interface/IUser.ts";
import { BasePageStore, createTablePageStore } from "@/stores/basePage.store";

export type UserPageState = BasePageStore<IUser>;

export const useUserPageStore = createTablePageStore<IUser>({
    persistKey: "user-page-state",
});
