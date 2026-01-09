import { getSampleData } from "@/apis/grid.api";
import GridTableClient from "@/components/grid/GridTable";

const ChartPage = () => {
    const { rows } = await getSampleData({
        page: 1,
        pageSize: 100,
    });

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
                        서버에서 페이지 인덱스를 받아오는 형태의 간단한 데이터테이블
                        예시입니다.
                    </p>
                </header>
                <GridTableClient initialData={rows} />
            </div>
        </div>
    );
};

export default ChartPage;
