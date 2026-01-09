import type { GridRow } from "@/interface/grid.interface";
import { GRID_SAMPLE_DATA } from "@/tests/gridSampleData";

interface GridResponse {
  rows: GridRow[];
  total: number;
}

interface GetSampleDataParams {
  page: number;
  pageSize: number;
}

export async function getSampleDataApi({
  page,
  pageSize,
}: GetSampleDataParams): Promise<GridResponse> {
  const startIndex = (page - 1) * pageSize;
  const rows = GRID_SAMPLE_DATA.slice(startIndex, startIndex + pageSize);

  return {
    rows,
    total: GRID_SAMPLE_DATA.length,
  };
}
