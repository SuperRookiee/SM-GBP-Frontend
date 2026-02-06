import { useMemo } from "react";
import { GRID_CONSTANTS } from "@/constants/demoGrid.constants";
import { USER_TABLE_COLUMNS, USER_TABLE_FILTER_OPTIONS } from "@/constants/userPage.constants";
import { useDemoGridStore } from "@/stores/demoGrid.store";
import type { IDemoGridRow } from "@/interface/IDemoGrid.interface";
import DataTable from "@/components/grid/DataTable";

const USER_TABLE_ROWS: IDemoGridRow[] = [
    { id: "USR-1001", customer: "김지우", email: "jiwoo.kim@example.com", role: "관리자", status: "활성" },
    { id: "USR-1002", customer: "박서준", email: "seojoon.park@example.com", role: "매니저", status: "활성" },
    { id: "USR-1003", customer: "이하늘", email: "haneul.lee@example.com", role: "스태프", status: "대기" },
    { id: "USR-1004", customer: "정민수", email: "minsu.jung@example.com", role: "스태프", status: "활성" },
    { id: "USR-1005", customer: "오수빈", email: "subin.oh@example.com", role: "게스트", status: "비활성" },
    { id: "USR-1006", customer: "강도윤", email: "doyoon.kang@example.com", role: "매니저", status: "활성" },
    { id: "USR-1007", customer: "최다은", email: "daeun.choi@example.com", role: "스태프", status: "활성" },
    { id: "USR-1008", customer: "윤지호", email: "jiho.yoon@example.com", role: "스태프", status: "대기" },
    { id: "USR-1009", customer: "문세아", email: "sea.moon@example.com", role: "게스트", status: "비활성" },
    { id: "USR-1010", customer: "홍유나", email: "yuna.hong@example.com", role: "관리자", status: "활성" },
    { id: "USR-1011", customer: "한건우", email: "geonwoo.han@example.com", role: "매니저", status: "활성" },
    { id: "USR-1012", customer: "서하린", email: "harin.seo@example.com", role: "스태프", status: "활성" },
];

const UserPage = () => {
    const query = useDemoGridStore((state) => state.query);
    const filterKey = useDemoGridStore((state) => state.filterKey);
    const sortKey = useDemoGridStore((state) => state.sortKey);
    const sortDirection = useDemoGridStore((state) => state.sortDirection);
    const page = useDemoGridStore((state) => state.page);
    const pageSize = GRID_CONSTANTS.pageSize;

    const filteredRows = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        const byQuery = (row: IDemoGridRow) => {
            if (!normalizedQuery) return true;
            if (filterKey === "all") {
                return Object.values(row).some((value) =>
                    String(value).toLowerCase().includes(normalizedQuery),
                );
            }
            return String(row[filterKey]).toLowerCase().includes(normalizedQuery);
        };

        const rows = USER_TABLE_ROWS.filter(byQuery);
        if (!sortKey) return rows;

        return [...rows].sort((a, b) => {
            const left = String(a[sortKey]).toLowerCase();
            const right = String(b[sortKey]).toLowerCase();
            if (left === right) return 0;
            const order = left > right ? 1 : -1;
            return sortDirection === "asc" ? order : -order;
        });
    }, [filterKey, query, sortDirection, sortKey]);

    const total = filteredRows.length;
    const startIndex = (page - 1) * pageSize;
    const rows = filteredRows.slice(startIndex, startIndex + pageSize);

    return (
        <div className="flex min-h-full items-center justify-center">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                <header className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">User Management</p>
                    <h1 className="text-3xl font-semibold tracking-tight">User Page</h1>
                    <p className="text-sm text-muted-foreground">
                        사용자 상태, 권한, 이메일을 한 번에 확인할 수 있는 목록입니다.
                    </p>
                </header>
                <DataTable
                    title="사용자 목록"
                    description="검색 및 정렬 결과는 페이지 이동 시 유지됩니다."
                    rows={rows}
                    total={total}
                    pageSize={pageSize}
                    filterOptions={USER_TABLE_FILTER_OPTIONS}
                    columns={USER_TABLE_COLUMNS}
                    searchPlaceholder="이름, 이메일, 권한으로 검색"
                />
            </div>
        </div>
    );
};

export default UserPage;
