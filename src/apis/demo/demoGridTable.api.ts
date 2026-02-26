import {DEMO_GRID_TABLE_SAMPLE_DATA} from "@/tests/data/demoGridTableSampleData.test.ts";
import type {IDemoGridSortOption, IDemoGridTableRow, IDemoGridTableSampleDataParams} from "@/interfaces/demo/IDemoGridTable.interface.ts";

// #. 정렬 방향에 따라 두 값을 비교
const compareByDirection = (a: string | number, b: string | number, direction: "asc" | "desc") => {
    const comparison = typeof a === "number" && typeof b === "number"
        ? a - b
        : String(a).localeCompare(String(b), "ko", { numeric: true });

    return direction === "asc" ? comparison : -comparison;
};

// #. 정렬 조건에 따라 목록을 정렬
const sortRows = (rows: IDemoGridTableRow[], sorters: IDemoGridSortOption[] = []) => {
    if (sorters.length === 0) return rows;

    return [...rows].sort((prev, next) => {
        for (const sorter of sorters) {
            const compared = compareByDirection(prev[sorter.key], next[sorter.key], sorter.direction);
            if (compared !== 0) return compared;
        }
        return 0;
    });
};

export const getDemoGridTableSampleDataApi = async ({
    keyword,
    dateFrom,
    dateTo,
    includeDiscontinued = true,
    categories = [],
    statuses = [],
    sorters = [],
}: IDemoGridTableSampleDataParams): Promise<IDemoGridTableRow[]> => {
    const loweredKeyword = keyword?.trim().toLowerCase() ?? "";

    const filteredRows = DEMO_GRID_TABLE_SAMPLE_DATA.filter((row) => {
        const searchableText = `${row.id} ${row.product} ${row.category} ${row.price} ${row.stock} ${row.status} ${row.launchDate}`.toLowerCase();

        const includeByKeyword = !loweredKeyword || searchableText.includes(loweredKeyword);
        const includeByDateFrom = !dateFrom || row.launchDate >= dateFrom;
        const includeByDateTo = !dateTo || row.launchDate <= dateTo;
        const includeByDiscontinued = includeDiscontinued || row.discontinued !== "Y";
        const includeByCategory = categories.length === 0 || categories.includes(row.category);
        const includeByStatus = statuses.length === 0 || statuses.includes(row.status);

        return includeByKeyword && includeByDateFrom && includeByDateTo && includeByDiscontinued && includeByCategory && includeByStatus;
    });

    await new Promise((resolve) => setTimeout(resolve, 700));

    return sortRows(filteredRows, sorters);
};


