import type { IDemoGridRow } from "@/interface/demoGrid.interface";
import { DEMO_GRID_SAMPLE_DATA } from "@/tests/demoGridSampleData.test.ts";

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
}

/**
 * 샘플 데이터를 페이지 단위로 반환하는 API 함수
 * @param page 페이지 번호
 * @param pageSize 페이지 크기
 * @returns 샘플 데이터와 전체 건수
 */
export const getDemoGridSampleDataApi = async ({
  page,
  pageSize,
}: IGetSampleDataParams): Promise<IDemoGridResponse> => {
  const startIndex = (page - 1) * pageSize;
  const rows = DEMO_GRID_SAMPLE_DATA.slice(startIndex, startIndex + pageSize);

  // 인위적으로 1초 지연
  await new Promise((res) => setTimeout(res, 1000));

  return {
    rows,
    total: DEMO_GRID_SAMPLE_DATA.length,
  };
}
