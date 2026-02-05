import { useEffect, useEffectEvent, useState } from "react";
import { getDemoGridSampleDataApi } from "@/apis/demoGrid.api.ts";
import type { DemoGridColumn, DemoGridFilterOption, IDemoGridRow } from "@/interface/demoGrid.interface.ts";
import GridTable from "@/components/grid/GridTable.tsx";

// Grid 데이터 테이블 페이지 컴포넌트 함수
const DemoGridPage = () => {
  const [rows, setRows] = useState<IDemoGridRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // #. 데이터를 불러온 뒤 상태를 갱신하는 함수
  const handleRowsLoaded = useEffectEvent((fetchedRows: IDemoGridRow[]) => {
    setRows(fetchedRows);
    setIsLoading(false);
  });

  useEffect(() => {
    let isMounted = true;

    // #. 샘플 데이터를 불러오는 함수
    const fetchRows = async () => {
      const { rows: fetchedRows } = await getDemoGridSampleDataApi({
        page: 1,
        pageSize: 100,
      });

      // 비동기 호출 후 컴포넌트가 마운트되어 있을 때만 상태를 업데이트합니다.
      if (isMounted) {
        handleRowsLoaded(fetchedRows);
      }
    };

    fetchRows();

    return () => {
      isMounted = false;
    };
  }, []);

  const filterOptions: DemoGridFilterOption[] = [
    { value: "all", label: "전체" },
    { value: "id", label: "문서 번호" },
    { value: "customer", label: "담당자" },
    { value: "email", label: "이메일" },
    { value: "role", label: "역할" },
    { value: "status", label: "상태" },
  ]

  const columns: DemoGridColumn[] = [
    { key: "id", label: "문서 번호", cellClassName: "font-medium" },
    { key: "customer", label: "담당자" },
    { key: "email", label: "이메일" },
    { key: "role", label: "역할" },
    {
      key: "status",
      label: "상태",
      render: (row) => (
          <span className="inline-flex items-center rounded-full border border-border px-2.5 py-1 text-xs font-medium text-foreground">
            {row.status}
          </span>
      ),
    },
  ]

  return (
      <div className="flex min-h-full items-center justify-center">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground">
            Demo Grid
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Demo Data Table
          </h1>
          <p className="text-sm text-muted-foreground">
            서버에서 페이지 인덱스를 받아오는 형태의 간단한 데이터테이블 예시입니다.
          </p>
        </header>
        <GridTable
          title="거래 내역 목록"
          description="검색 조건은 저장되어 새로고침 후에도 유지됩니다."
          initialData={rows}
          isLoading={isLoading}
          filterOptions={filterOptions}
          columns={columns}
        />
      </div>
    </div>
  );
};

export default DemoGridPage;
