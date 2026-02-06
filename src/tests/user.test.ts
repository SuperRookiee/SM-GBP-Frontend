import type { IUserInterface } from "@/interface/IUser.interface.ts";
import { Role } from "@/enums/role.ts";

export const USER_SAMPLE_DATA: IUserInterface[] = [
    {
        id: 1,
        name: "유저 A",
        role: Role.ADMIN,
        user_id: 'AA'
    },
    {
        id: 2,
        name: "유저 B",
        role: Role.USER,
        user_id: 'BB'
    },
    {
        id: 3,
        name: "유저 C",
        role: Role.GUEST,
        user_id: 'CC'
    }
];