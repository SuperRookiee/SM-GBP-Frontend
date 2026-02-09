import type { IUser, IUserSampleDataParams } from "@/interface/IUser.ts";
import { USER_SAMPLE_DATA } from "@/tests/user.test.ts";

export type UserTableResponse = {
    rows: IUser[];
    total: number;
};

export const getUserSampleDataApi = async ({
    page,
    pageSize,
    query,
    filterKey = "all",
    sortKey,
    sortDirection = "asc",
}: IUserSampleDataParams): Promise<UserTableResponse> => {
    const trimmedQuery = query?.trim().toLowerCase() ?? "";
    const filteredRows = USER_SAMPLE_DATA.filter((row) => {
        if (!trimmedQuery) return true;
        const fields = filterKey === "all" ? Object.values(row) : [row[filterKey]];
        return fields.some((value) => String(value).toLowerCase().includes(trimmedQuery));
    });

    const sortedRows = [...filteredRows].sort((a, b) => {
        if (!sortKey) return 0;
        const aValue = String(a[sortKey]);
        const bValue = String(b[sortKey]);
        const comparison = aValue.localeCompare(bValue, "ko", { numeric: true });
        return sortDirection === "asc" ? comparison : -comparison;
    });

    const startIndex = (page - 1) * pageSize;
    const rows = sortedRows.slice(startIndex, startIndex + pageSize);

    await new Promise((res) => setTimeout(res, 1000));

    return {
        rows,
        total: sortedRows.length,
    };
};
