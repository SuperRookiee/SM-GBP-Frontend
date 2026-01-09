import type { GridRow } from "@/interface/grid.interface";
import { GRID_SAMPLE_DATA } from "@/tests/gridSampleData";

/**
 * Grid API 응답 데이터 형식
 */
interface GridResponse {
  rows: GridRow[];
  total: number;
}

/**
 * 샘플 데이터 요청 파라미터
 */
interface GetSampleDataParams {
  page: number;
  pageSize: number;
}

/**
 * 샘플 데이터를 페이지 단위로 반환하는 API 함수
 * @param page 페이지 번호
 * @param pageSize 페이지 크기
 * @returns 샘플 데이터와 전체 건수
 */
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
