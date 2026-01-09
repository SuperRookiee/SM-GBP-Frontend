import { useEffect, useState } from "react";

import { getSampleData } from "@/apis/grid.api";
import GridTable from "@/components/grid/GridTable";
import type { GridRow } from "@/interface/grid.interface";

const GridPage = () => {
  const [rows, setRows] = useState<GridRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchRows = async () => {
      const { rows: fetchedRows } = await getSampleData({
        page: 1,
        pageSize: 100,
      });

      if (isMounted) {
        setRows(fetchedRows);
        setIsLoading(false);
      }
    };

    fetchRows();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900 dark:bg-black dark:text-zinc-50">
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
          <GridTable initialData={rows} />
        )}
      </div>
    </div>
  );
};

export default GridPage;
