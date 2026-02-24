import {Role} from "@/enums/role.ts";
import type {IUser} from "@/interfaces/IUser.ts";

export const USER_SAMPLE_DATA: IUser[] = [
    {
        id: 1,
        name: "A",
        role: Role.ADMIN,
        user_id: "aa@miracle.com",
        password: "1",
    },
    {
        id: 2,
        name: "B",
        role: Role.USER,
        user_id: "bb@miracle.com",
        password: "1",
    },
    {
        id: 3,
        name: "C",
        role: Role.GUEST,
        user_id: "cc@miracle.com",
        password: "1",
    },
];
