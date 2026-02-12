import { type ReactNode } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";

type TablePaginationProps = {
  currentPage: number;
  totalPages: number;
  pageNumbers: number[];
  previousPage: number | null;
  nextPage: number | null;
  totalCount: number;
  isLoading?: boolean;
  caption?: ReactNode;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
};

const Pagination = ({
    currentPage,
    totalPages,
    pageNumbers,
    previousPage,
    nextPage,
    totalCount,
    isLoading = false,
    caption,
    pageSize,
    pageSizeOptions = [5, 10, 25, 50, 100],
    onPageChange,
    onPageSizeChange,
}: TablePaginationProps) => {
    const resolvedCaption = caption ?? `총 ${totalCount} 건`;

    const onChangePageSize = (value: string) => {
        if (!onPageSizeChange) return;
        const nextPageSize = Number(value);
        if (Number.isNaN(nextPageSize)) return;

        onPageSizeChange(nextPageSize);
        onPageChange(1);
    };

    return (
        <div className="flex flex-col gap-4 border-t border-border px-6 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between" aria-busy={isLoading}>
            <div className="flex flex-wrap items-center gap-3">
                <span>
                    Page {currentPage} of {totalPages}
                </span>
                <span className="inline-block min-w-10 text-right tabular-nums">{resolvedCaption}</span>

                {onPageSizeChange && pageSize !== undefined && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Rows</span>
                        <Select value={String(pageSize)} onValueChange={onChangePageSize}>
                            <SelectTrigger className="h-8 w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {pageSizeOptions.map((size) => (
                                    <SelectItem key={size} value={String(size)}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => onPageChange(1)} disabled={currentPage === 1}>처음</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => previousPage && onPageChange(previousPage)} disabled={!previousPage}>이전</Button>
                {pageNumbers.map((pageNumber) => (
                    <Button
                        key={pageNumber}
                        type="button"
                        size="sm"
                        variant={pageNumber === currentPage ? "default" : "outline"}
                        className={pageNumber === currentPage ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90" : undefined}
                        onClick={() => onPageChange(pageNumber)}
                    >
                        {pageNumber}
                    </Button>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => nextPage && onPageChange(nextPage)} disabled={!nextPage}>다음</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>마지막</Button>
            </div>
        </div>
    );
};

export default Pagination;
