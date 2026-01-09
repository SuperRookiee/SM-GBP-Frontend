"use client";

import { useEffect, useMemo } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { GridRow } from "@/interface/grid.interface";
import { useGridStore } from "../../stores/gridStore";

// GridTable 컴포넌트가 받는 props 타입입니다.
interface GridTableClientProps {
  initialData: GridRow[];
}

// 페이지네이션 기본 설정 값입니다.
const PAGE_SIZE = 5;
const PAGE_WINDOW = 5;

// #. Grid 데이터를 보여주는 테이블 컴포넌트 함수
const GridTable = ({ initialData }: GridTableClientProps) => {
  const data = useGridStore((state) => state.data);
  const query = useGridStore((state) => state.query);
  const filterKey = useGridStore((state) => state.filterKey);
  const sortKey = useGridStore((state) => state.sortKey);
  const sortDirection = useGridStore((state) => state.sortDirection);
  const page = useGridStore((state) => state.page);
  const setData = useGridStore((state) => state.setData);
  const setQuery = useGridStore((state) => state.setQuery);
  const setFilterKey = useGridStore((state) => state.setFilterKey);
  const setSort = useGridStore((state) => state.setSort);
  const setPage = useGridStore((state) => state.setPage);

  // 최초 로드 시 스토어 데이터가 비어 있으면 초기 데이터를 주입합니다.
  useEffect(() => {
    if (data.length === 0) {
      setData(initialData);
    }
  }, [data.length, initialData, setData]);

  // 검색어 및 필터 조건에 따라 데이터를 필터링합니다.
  const filteredRows = useMemo(() => {
    if (!query.trim()) {
      return data;
    }

    const normalized = query.toLowerCase();
    const fields: Array<keyof GridRow> =
      filterKey === "all"
        ? ["id", "customer", "email", "role", "status"]
        : [filterKey];

    return data.filter((row) =>
      fields
        .map((field) => String(row[field]))
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [data, filterKey, query]);

  // 선택된 정렬 기준으로 데이터를 정렬합니다.
  const sortedRows = useMemo(() => {
    if (!sortKey) {
      return filteredRows;
    }

    const sorted = [...filteredRows].sort((a, b) => {
      const left = String(a[sortKey]);
      const right = String(b[sortKey]);
      return left.localeCompare(right, "ko");
    });

    return sortDirection === "asc" ? sorted : sorted.reverse();
  }, [filteredRows, sortDirection, sortKey]);

  // 페이지네이션 계산에 필요한 값들을 준비합니다.
  const totalPages = Math.max(Math.ceil(sortedRows.length / PAGE_SIZE), 1);
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const rows = sortedRows.slice(startIndex, startIndex + PAGE_SIZE);

  // 현재 페이지가 범위를 벗어나면 스토어 페이지를 보정합니다.
  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [currentPage, page, setPage]);

  const previousPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  // 화면에 표시할 페이지 번호 범위를 계산합니다.
  const pageWindowStart =
    Math.floor((currentPage - 1) / PAGE_WINDOW) * PAGE_WINDOW + 1;
  const pageWindowEnd = Math.min(totalPages, pageWindowStart + PAGE_WINDOW - 1);
  const pageNumbers = Array.from(
    { length: pageWindowEnd - pageWindowStart + 1 },
    (_, index) => pageWindowStart + index,
  );

  // #. 정렬 방향 표시를 반환하는 함수
  const sortIndicator = (key: string) => {
    if (sortKey !== key) {
      return null;
    }

    return (
      <span className="ml-1 text-xs text-zinc-400">
        {sortDirection === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            거래 내역 목록
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            검색 조건은 저장되어 새로고침 후에도 유지됩니다.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
          <div className="w-full sm:w-40">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              검색 조건
            </label>
            <Select
              value={filterKey}
              onValueChange={(value) =>
                setFilterKey(value as "all" | keyof GridRow)
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="검색 조건 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="id">문서 번호</SelectItem>
                <SelectItem value="customer">담당자</SelectItem>
                <SelectItem value="email">이메일</SelectItem>
                <SelectItem value="role">역할</SelectItem>
                <SelectItem value="status">상태</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-72">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              검색
            </label>
            <Input
              className="mt-2"
              placeholder="검색어를 입력하세요"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
      </div>

      <Table>
        <TableCaption>총 {sortedRows.length}건의 거래 내역</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                className="h-auto justify-start px-0 py-0 text-left text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                type="button"
                variant="ghost"
                onClick={() => setSort("id")}
              >
                문서 번호
                {sortIndicator("id")}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                className="h-auto justify-start px-0 py-0 text-left text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                type="button"
                variant="ghost"
                onClick={() => setSort("customer")}
              >
                담당자
                {sortIndicator("customer")}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                className="h-auto justify-start px-0 py-0 text-left text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                type="button"
                variant="ghost"
                onClick={() => setSort("email")}
              >
                이메일
                {sortIndicator("email")}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                className="h-auto justify-start px-0 py-0 text-left text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                type="button"
                variant="ghost"
                onClick={() => setSort("role")}
              >
                역할
                {sortIndicator("role")}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                className="h-auto justify-start px-0 py-0 text-left text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                type="button"
                variant="ghost"
                onClick={() => setSort("status")}
              >
                상태
                {sortIndicator("status")}
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.id}</TableCell>
              <TableCell>{row.customer}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.role}</TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:text-zinc-200">
                  {row.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-6 flex flex-col gap-4 border-t border-zinc-200 pt-4 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage(1)}
            disabled={currentPage === 1}
          >
            처음
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => previousPage && setPage(previousPage)}
            disabled={!previousPage}
          >
            이전
          </Button>

          {pageNumbers.map((pageNumber) => (
            <Button
              key={pageNumber}
              className={
                pageNumber === currentPage
                  ? "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 dark:border-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  : undefined
              }
              type="button"
              variant={pageNumber === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => nextPage && setPage(nextPage)}
            disabled={!nextPage}
          >
            다음
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            마지막
          </Button>
        </div>
      </div>
    </section>
  );
}

export default GridTable;
