import { useEffect, useEffectEvent, useState } from "react";

import { getSampleDataApi } from "@/apis/grid.api";
import AGGridTable from "@/components/grid/AGGridTable";
import type { GridRow } from "@/interface/grid.interface";

// #. Grid 데이터 테이블 페이지 컴포넌트 함수
const GridPage = () => {
  const [rows, setRows] = useState<GridRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // #. 데이터를 불러온 뒤 상태를 갱신하는 함수
  const handleRowsLoaded = useEffectEvent((fetchedRows: GridRow[]) => {
    setRows(fetchedRows);
    setIsLoading(false);
  });

  useEffect(() => {
    let isMounted = true;

    // #. 샘플 데이터를 불러오는 함수
    const fetchRows = async () => {
      const { rows: fetchedRows } = await getSampleDataApi({
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

  return (
    <div className="bg-zinc-50 px-6 py-6 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="space-y-2">
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            Grid / Data Table
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            거래 내역 데이터 테이블
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            서버에서 페이지 인덱스를 받아오는 형태의 간단한 데이터테이블 예시입니다.
          </p>
        </header>
        {isLoading ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            데이터를 불러오는 중입니다...
          </p>
        ) : (
          <AGGridTable initialData={rows} />
        )}
      </div>
    </div>
  );
};

export default GridPage;
