import { useEffect, useRef } from "react";
import Grid from "tui-grid";
import "tui-grid/dist/tui-grid.css";

const SAMPLE_ROWS = [
    { id: 1, product: "무선 키보드", category: "전자기기", price: 65000, stock: 25, status: "판매중" },
    { id: 2, product: "블루투스 마우스", category: "전자기기", price: 32000, stock: 48, status: "판매중" },
    { id: 3, product: "텀블러", category: "생활용품", price: 18000, stock: 0, status: "품절" },
    { id: 4, product: "노트북 파우치", category: "패션", price: 29000, stock: 15, status: "판매중" },
    { id: 5, product: "모니터 받침대", category: "사무용품", price: 41000, stock: 7, status: "품절임박" },
    { id: 6, product: "웹캠", category: "전자기기", price: 76000, stock: 12, status: "판매중" },
    { id: 7, product: "독서대", category: "사무용품", price: 24000, stock: 34, status: "판매중" },
    { id: 8, product: "LED 스탠드", category: "생활용품", price: 37000, stock: 3, status: "품절임박" },
];

const GridTablePage = () => {
    const gridWrapperRef = useRef<HTMLDivElement | null>(null);
    const gridInstanceRef = useRef<Grid | null>(null);

    useEffect(() => {
        if (!gridWrapperRef.current) {
            return;
        }

        const grid = new Grid({
            el: gridWrapperRef.current,
            bodyHeight: 360,
            rowHeaders: ["rowNum"],
            scrollX: false,
            scrollY: true,
            columns: [
                { header: "상품 ID", name: "id", align: "center", width: 100, sortable: true },
                { header: "상품명", name: "product", minWidth: 180, sortable: true },
                { header: "카테고리", name: "category", align: "center", width: 140, sortable: true },
                {
                    header: "가격",
                    name: "price",
                    align: "right",
                    width: 140,
                    sortable: true,
                    formatter: ({ value }) => `${Number(value).toLocaleString()}원`,
                },
                { header: "재고", name: "stock", align: "right", width: 100, sortable: true },
                { header: "상태", name: "status", align: "center", width: 140, sortable: true },
            ],
            data: SAMPLE_ROWS,
            pageOptions: {
                perPage: 5,
                useClient: true,
            },
        });

        gridInstanceRef.current = grid;

        return () => {
            gridInstanceRef.current?.destroy();
            gridInstanceRef.current = null;
        };
    }, []);

    return (
        <div className="flex min-h-full min-w-0 items-center justify-center overflow-hidden">
            <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-6 overflow-hidden">
                <header className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">Demo GridTable</p>
                    <h1 className="text-3xl font-semibold tracking-tight">TOAST UI GridTable</h1>
                    <p className="text-sm text-muted-foreground">
                        TOAST UI Grid를 사용한 예시 화면입니다. 정렬과 페이지네이션을 바로 테스트할 수 있습니다.
                    </p>
                </header>
                <div className="overflow-hidden rounded-md border border-border bg-background p-4">
                    <div ref={gridWrapperRef} />
                </div>
            </div>
        </div>
    );
};

export default GridTablePage;
