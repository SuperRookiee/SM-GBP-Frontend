import type { GridRow } from "@/interface/grid.interface";

interface GridResponse {
  rows: GridRow[];
  total: number;
}

const SAMPLE_DATA: GridRow[] = [
  {
    id: "INV-001",
    customer: "김서연",
    email: "seoyeon.kim@example.com",
    role: "구매 관리자",
    status: "승인",
  },
  {
    id: "INV-002",
    customer: "이준호",
    email: "junho.lee@example.com",
    role: "재무 담당",
    status: "대기",
  },
  {
    id: "INV-003",
    customer: "박지수",
    email: "jisoo.park@example.com",
    role: "운영 매니저",
    status: "승인",
  },
  {
    id: "INV-004",
    customer: "정민호",
    email: "minho.jung@example.com",
    role: "데이터 분석가",
    status: "보류",
  },
  {
    id: "INV-005",
    customer: "최유나",
    email: "yuna.choi@example.com",
    role: "영업 리드",
    status: "승인",
  },
  {
    id: "INV-006",
    customer: "송다은",
    email: "daeun.song@example.com",
    role: "프로덕트 오너",
    status: "대기",
  },
  {
    id: "INV-007",
    customer: "오지훈",
    email: "jihoon.oh@example.com",
    role: "서비스 운영",
    status: "승인",
  },
  {
    id: "INV-008",
    customer: "한수민",
    email: "sumin.han@example.com",
    role: "마케팅 매니저",
    status: "보류",
  },
  {
    id: "INV-009",
    customer: "윤태호",
    email: "taeho.yoon@example.com",
    role: "파트너 관리",
    status: "대기",
  },
  {
    id: "INV-010",
    customer: "강민지",
    email: "minji.kang@example.com",
    role: "CS 매니저",
    status: "승인",
  },
];

interface GetSampleDataParams {
  page: number;
  pageSize: number;
}

export async function getSampleData({
  page,
  pageSize,
}: GetSampleDataParams): Promise<GridResponse> {
  const startIndex = (page - 1) * pageSize;
  const rows = SAMPLE_DATA.slice(startIndex, startIndex + pageSize);

  return {
    rows,
    total: SAMPLE_DATA.length,
  };
}
