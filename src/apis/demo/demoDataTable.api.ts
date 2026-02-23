import type { IDemoDataTableSampleDataParams } from "@/interfaces/demo/IDemoDataTable.interface.ts";
import type { DemoDataTableResponse } from "@/types/demo/demoDataTable.types.ts";
import { DEMO_DATA_TABLE_SAMPLE_DATA } from "@/tests/data/demoDataTableSampleData.test.ts";

/**
 * 샘플 데이터를 페이지 단위로 반환하는 API 함수
 * @param page 페이지 번호
 * @param pageSize 페이지 크기
 * @param query
 * @param filterKey
 * @param sortKey
 * @param sortDirection
 * @returns 샘플 데이터와 전체 건수
 */
export const getDemoDataTableSampleDataApi = async ({
    page,
    pageSize,
    query,
    filterKey = "all",
    sortKey,
    sortDirection = "asc",
}: IDemoDataTableSampleDataParams): Promise<DemoDataTableResponse> => {
    const trimmedQuery = query?.trim().toLowerCase() ?? "";
    const filteredRows = DEMO_DATA_TABLE_SAMPLE_DATA.filter((row) => {
        if (!trimmedQuery) return true;
        const fields =
            filterKey === "all"
                ? Object.values(row)
                : [row[filterKey]];
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

    // 인위적으로 1초 지연
    await new Promise((res) => setTimeout(res, 1000));

    return {
        rows,
        total: sortedRows.length,
    };
}
