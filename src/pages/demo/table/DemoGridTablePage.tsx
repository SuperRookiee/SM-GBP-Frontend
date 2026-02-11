import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Grid from "tui-grid";
import "tui-grid/dist/tui-grid.css";

type DemoRow = {
    id: number;
    product: string;
    category: "전자기기" | "생활용품" | "패션" | "사무용품";
    price: number;
    stock: number;
    status: "판매중" | "품절" | "품절임박";
    launchDate: string;
    discontinued: "Y" | "N";
    _attributes?: {
        className?: {
            row?: string[];
        };
    };
};

const STATUS_OPTIONS = ["판매중", "품절", "품절임박"] as const;
const CATEGORY_OPTIONS = ["전자기기", "생활용품", "패션", "사무용품"] as const;

const SAMPLE_ROWS: DemoRow[] = [
    { id: 1, product: "무선 키보드", category: "전자기기", price: 65000, stock: 25, status: "판매중", launchDate: "2024-01-11", discontinued: "N" },
    { id: 2, product: "블루투스 마우스", category: "전자기기", price: 32000, stock: 48, status: "판매중", launchDate: "2024-02-03", discontinued: "N" },
    { id: 3, product: "텀블러", category: "생활용품", price: 18000, stock: 0, status: "품절", launchDate: "2023-10-19", discontinued: "Y" },
    { id: 4, product: "노트북 파우치", category: "패션", price: 29000, stock: 15, status: "판매중", launchDate: "2024-03-15", discontinued: "N" },
    { id: 5, product: "모니터 받침대", category: "사무용품", price: 41000, stock: 7, status: "품절임박", launchDate: "2023-12-01", discontinued: "N" },
    { id: 6, product: "웹캠", category: "전자기기", price: 76000, stock: 12, status: "판매중", launchDate: "2024-05-22", discontinued: "N" },
    { id: 7, product: "독서대", category: "사무용품", price: 24000, stock: 34, status: "판매중", launchDate: "2024-04-08", discontinued: "N" },
    { id: 8, product: "LED 스탠드", category: "생활용품", price: 37000, stock: 3, status: "품절임박", launchDate: "2023-09-06", discontinued: "Y" },
];

const withRowClassName = (rows: DemoRow[]) =>
    rows.map((row) => ({
        ...row,
        _attributes: {
            className: {
                row: row.stock <= 3 ? ["row-low-stock"] : row.discontinued === "Y" ? ["row-discontinued"] : [],
            },
        },
    }));

const DemoGridTablePage = () => {
    const gridWrapperRef = useRef<HTMLDivElement | null>(null);
    const gridInstanceRef = useRef<Grid | null>(null);
    const [rows, setRows] = useState<DemoRow[]>(SAMPLE_ROWS);
    const [keyword, setKeyword] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [frozenEnabled, setFrozenEnabled] = useState(true);
    const [eventMessage, setEventMessage] = useState("이벤트 로그가 여기에 표시됩니다.");
    const [columnVisible, setColumnVisible] = useState<Record<string, boolean>>({
        id: true,
        product: true,
        category: true,
        price: true,
        stock: true,
        status: true,
        launchDate: true,
        discontinued: true,
    });

    const filteredRows = useMemo(() => {
        const lowered = keyword.trim().toLowerCase();

        return withRowClassName(
            rows.filter((row) => {
                const searchable = `${row.id} ${row.product} ${row.category} ${row.price} ${row.stock} ${row.status} ${row.launchDate}`.toLowerCase();
                const isInKeyword = lowered.length === 0 || searchable.includes(lowered);
                const isAfterFrom = !dateFrom || row.launchDate >= dateFrom;
                const isBeforeTo = !dateTo || row.launchDate <= dateTo;
                return isInKeyword && isAfterFrom && isBeforeTo;
            }),
        );
    }, [rows, keyword, dateFrom, dateTo]);

    const applyGridData = useCallback((data: DemoRow[]) => {
        if (!gridInstanceRef.current) return;
        gridInstanceRef.current.resetData(data);
    }, []);

    const handleToggleColumn = useCallback((columnName: string, visible: boolean) => {
        const grid = gridInstanceRef.current;
        if (!grid) return;

        if (visible) {
            grid.showColumn(columnName);
        } else {
            grid.hideColumn(columnName);
        }

        setColumnVisible((prev) => ({ ...prev, [columnName]: visible }));
    }, []);

    const handleFrozenToggle = useCallback((enabled: boolean) => {
        const grid = gridInstanceRef.current;
        if (!grid) return;
        grid.setFrozenColumnCount(enabled ? 2 : 0);
        setFrozenEnabled(enabled);
    }, []);

    const handleAddRow = useCallback(() => {
        const grid = gridInstanceRef.current;
        if (!grid) return;

        const nextId = rows.length ? Math.max(...rows.map((row) => row.id)) + 1 : 1;
        const newRow: DemoRow = {
            id: nextId,
            product: "신규 상품",
            category: "전자기기",
            price: 10000,
            stock: 1,
            status: "판매중",
            launchDate: "2024-06-01",
            discontinued: "N",
        };

        const nextRows = [...rows, newRow];
        setRows(nextRows);
        grid.appendRow(newRow, { at: rows.length, focus: true });
        setEventMessage(`행 추가: id=${nextId}`);
    }, [rows]);

    const handleDeleteRows = useCallback(() => {
        const grid = gridInstanceRef.current;
        if (!grid) return;

        const checkedRowKeys = grid.getCheckedRowKeys();
        if (checkedRowKeys.length === 0) {
            const focused = grid.getFocusedCell();
            if (typeof focused?.rowKey === "number") {
                checkedRowKeys.push(focused.rowKey);
            }
        }

        if (checkedRowKeys.length === 0) {
            setEventMessage("삭제할 행이 없습니다. 체크박스 또는 포커스를 선택해주세요.");
            return;
        }

        const nextRows = rows.filter((_, index) => !checkedRowKeys.includes(index));
        setRows(nextRows);
        checkedRowKeys.sort((a: number, b: number) => b - a).forEach((rowKey: number) => grid.removeRow(rowKey));
        setEventMessage(`행 삭제: ${checkedRowKeys.length}건`);
    }, [rows]);

    useEffect(() => {
        if (!gridWrapperRef.current) return;

        const columns = [
            // 정렬 / 멀티정렬 / 리사이즈 / 필터 예제 조합
            { header: "상품 ID", name: "id", align: "center", width: 100, sortable: true, validation: { required: true, dataType: "number", min: 1 } },
            {
                header: "상품명",
                name: "product",
                minWidth: 180,
                sortable: true,
                editor: "text",
                filter: { type: "text", showApplyBtn: true, showClearBtn: true },
                validation: { required: true },
            },
            {
                header: "카테고리",
                name: "category",
                align: "center",
                width: 140,
                sortable: true,
                editor: {
                    type: "select",
                    options: {
                        listItems: CATEGORY_OPTIONS.map((value) => ({ text: value, value })),
                    },
                },
                filter: {
                    type: "select",
                    showApplyBtn: true,
                    showClearBtn: true,
                    listItems: CATEGORY_OPTIONS.map((value) => ({ text: value, value })),
                },
            },
            {
                header: "가격",
                name: "price",
                align: "right",
                width: 140,
                sortable: true,
                editor: "text",
                validation: { required: true, dataType: "number", min: 1000, max: 999999 },
                formatter: ({ value }: { value: unknown }) => `${Number(value).toLocaleString()}원`,
            },
            {
                header: "재고",
                name: "stock",
                align: "right",
                width: 100,
                sortable: true,
                editor: "text",
                validation: { required: true, dataType: "number", min: 0, max: 1000 },
            },
            {
                header: "출시일",
                name: "launchDate",
                align: "center",
                width: 160,
                sortable: true,
                editor: {
                    // 공식 datePicker 에디터 예제 구조 참고
                    type: "datePicker",
                    options: {
                        format: "yyyy-MM-dd",
                        timepicker: false,
                    },
                },
            },
            {
                header: "상태",
                name: "status",
                align: "center",
                width: 140,
                sortable: true,
                editor: {
                    type: "select",
                    options: {
                        listItems: STATUS_OPTIONS.map((value) => ({ text: value, value })),
                    },
                },
                filter: {
                    type: "select",
                    showApplyBtn: true,
                    showClearBtn: true,
                    listItems: STATUS_OPTIONS.map((value) => ({ text: value, value })),
                },
            },
            {
                header: "단종",
                name: "discontinued",
                align: "center",
                width: 100,
                editor: {
                    type: "checkbox",
                    options: {
                        listItems: [
                            { text: "Y", value: "Y" },
                            { text: "N", value: "N" },
                        ],
                    },
                },
                formatter: ({ value }: { value: unknown }) => (value === "Y" ? "✅" : "-"),
            },
        ];

        const grid = new Grid({
            el: gridWrapperRef.current,
            data: withRowClassName(SAMPLE_ROWS),
            columns,
            bodyHeight: 420,
            rowHeaders: ["rowNum", "checkbox"],
            scrollX: true,
            scrollY: true,
            columnOptions: {
                resizable: true,
                frozenCount: 2,
            },
            pageOptions: {
                perPage: 5,
                useClient: true,
            },
        });

        grid.on("click", (event) => {
            const ev = event as { rowKey?: number | string; columnName?: string };
            setEventMessage(`onClick: rowKey=${String(ev.rowKey)} / column=${ev.columnName ?? "-"}`);
        });

        grid.on("dblclick", (event) => {
            const ev = event as { rowKey?: number | string; columnName?: string };
            setEventMessage(`onDblClick: rowKey=${String(ev.rowKey)} / column=${ev.columnName ?? "-"}`);
        });

        grid.on("afterChange", (event) => {
            const ev = event as { changes?: Array<{ columnName: string; value: unknown }> };
            const change = ev.changes?.[0];
            if (!change) return;
            setEventMessage(`onAfterChange: ${change.columnName} = ${String(change.value)}`);

            const currentData = grid.getData() as DemoRow[];
            setRows(
                currentData.map((row) => ({
                    ...row,
                    id: Number(row.id),
                    price: Number(row.price),
                    stock: Number(row.stock),
                })),
            );
        });

        grid.on("editingFinish", (event) => {
            const ev = event as { columnName?: string };
            setEventMessage(`onEditingFinish: ${ev.columnName ?? "-"} 편집 완료`);
        });

        gridInstanceRef.current = grid;

        return () => {
            // 페이지 unmount 시 Grid instance 정리
            grid.destroy();
            gridInstanceRef.current = null;
        };
    }, []);

    useEffect(() => {
        applyGridData(filteredRows);
    }, [filteredRows, applyGridData]);

    return (
        <div className="flex min-h-full min-w-0 items-center justify-center overflow-hidden">
            <div className="demo-grid-playground mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-4 overflow-hidden p-2">
                <header className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">Demo GridTable</p>
                    <h1 className="text-3xl font-semibold tracking-tight">TOAST UI Grid Feature Playground</h1>
                    <p className="text-sm text-muted-foreground">
                        공식 문서 예제(정렬, 필터, datePicker, 편집 이벤트)를 조합한 실습 페이지입니다.
                    </p>
                </header>

                <section className="rounded-md border border-border bg-background p-3">
                    <h2 className="mb-3 text-base font-semibold">Control Panel</h2>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                        <label className="flex flex-col gap-1 text-sm">
                            <span>전체 검색</span>
                            <input
                                value={keyword}
                                onChange={(event) => setKeyword(event.target.value)}
                                className="rounded border px-2 py-1"
                                placeholder="상품명/카테고리/상태 검색"
                            />
                        </label>

                        <label className="flex flex-col gap-1 text-sm">
                            <span>출시일 시작</span>
                            <input value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="rounded border px-2 py-1" type="date" />
                        </label>

                        <label className="flex flex-col gap-1 text-sm">
                            <span>출시일 종료</span>
                            <input value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="rounded border px-2 py-1" type="date" />
                        </label>

                        <div className="flex items-end gap-2">
                            <button type="button" onClick={handleAddRow} className="rounded bg-black px-3 py-2 text-sm text-white">
                                행 추가
                            </button>
                            <button type="button" onClick={handleDeleteRows} className="rounded border px-3 py-2 text-sm">
                                선택 행 삭제
                            </button>
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-4 border-t pt-3">
                        <label className="inline-flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={frozenEnabled} onChange={(event) => handleFrozenToggle(event.target.checked)} />
                            Frozen Column(앞 2개)
                        </label>

                        <button
                            type="button"
                            onClick={() => {
                                const grid = gridInstanceRef.current;
                                if (!grid) return;
                                grid.sort("price", true, true);
                                grid.sort("stock", false, true);
                                setEventMessage("멀티 정렬 실행: price ASC + stock DESC");
                            }}
                            className="rounded border px-3 py-1 text-sm"
                        >
                            멀티 정렬 실행
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                const grid = gridInstanceRef.current;
                                if (!grid) return;
                                grid.resetData([]);
                                setEventMessage("Empty data 상태 데모");
                            }}
                            className="rounded border px-3 py-1 text-sm"
                        >
                            Empty 상태
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                const grid = gridInstanceRef.current;
                                if (!grid) return;
                                grid.showLoading();
                                setEventMessage("Loading 상태 표시 중...");
                                window.setTimeout(() => {
                                    grid.hideLoading();
                                    applyGridData(filteredRows);
                                    setEventMessage("Loading 상태 해제");
                                }, 900);
                            }}
                            className="rounded border px-3 py-1 text-sm"
                        >
                            Loading 상태
                        </button>
                    </div>

                    <div className="mt-3 border-t pt-3">
                        <p className="mb-2 text-sm font-medium">컬럼 표시/숨김</p>
                        <div className="flex flex-wrap gap-3">
                            {Object.keys(columnVisible).map((column) => (
                                <label key={column} className="inline-flex items-center gap-1 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={columnVisible[column]}
                                        onChange={(event) => handleToggleColumn(column, event.target.checked)}
                                    />
                                    {column}
                                </label>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="overflow-hidden rounded-md border border-border bg-background p-4">
                    <div className="mb-2 text-sm text-muted-foreground">이벤트 로그: {eventMessage}</div>
                    <div ref={gridWrapperRef} />
                </section>
                <style>
                    {`
                        .demo-grid-playground .tui-grid-body-area tr:hover td {
                            background: rgba(96, 165, 250, 0.12) !important;
                        }
                        .demo-grid-playground .tui-grid-row.row-low-stock td {
                            background: rgba(251, 191, 36, 0.12);
                        }
                        .demo-grid-playground .tui-grid-row.row-discontinued td {
                            color: #9ca3af;
                        }
                    `}
                </style>
            </div>
        </div>
    );
};

export default DemoGridTablePage;
