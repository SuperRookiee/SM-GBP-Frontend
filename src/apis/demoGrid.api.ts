import type { IDemoGridRow } from "@/interface/demoGrid.interface";
import { DEMO_GRID_SAMPLE_DATA } from "@/tests/demoGridSampleData.test.ts";

export type DemoGridFilterKey = "all" | keyof IDemoGridRow;
export type DemoGridSortKey = keyof IDemoGridRow;
export type DemoGridSortDirection = "asc" | "desc";

/**
 * Grid API 응답 데이터 형식
 */
interface IDemoGridResponse {
    rows: IDemoGridRow[];
    total: number;
}

/**
 * 샘플 데이터 요청 파라미터
 */
interface IGetSampleDataParams {
    page: number;
    pageSize: number;
    query?: string;
    filterKey?: DemoGridFilterKey;
    sortKey?: DemoGridSortKey | null;
    sortDirection?: DemoGridSortDirection;
}

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
export const getDemoGridSampleDataApi = async ({
   page,
   pageSize,
   query,
   filterKey = "all",
   sortKey,
   sortDirection = "asc",
}: IGetSampleDataParams): Promise<IDemoGridResponse> => {
    const trimmedQuery = query?.trim().toLowerCase() ?? "";
    const filteredRows = DEMO_GRID_SAMPLE_DATA.filter((row) => {
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
