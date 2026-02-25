import { type ReactNode } from "react";
import { ChevronLeftIcon, ChevronsLeftIcon, ChevronRightIcon, ChevronsRightIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";

interface ITablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageNumbers: number[];
  previousPage: number | null;
  nextPage: number | null;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  caption?: ReactNode;
};

const Pagination = ({
    currentPage,
    totalPages,
    pageNumbers,
    previousPage,
    nextPage,
    isLoading = false,
    onPageChange,
}: ITablePaginationProps) => {
    const { t } = useTranslation();

    return (
        <div className="flex justify-end border-t border-border px-6 py-4 text-sm text-muted-foreground" aria-busy={isLoading}>
            <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" size="icon" onClick={() => onPageChange(1)} disabled={currentPage === 1} aria-label={t("common.first")}>
                    <ChevronsLeftIcon className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" size="icon" onClick={() => previousPage && onPageChange(previousPage)} disabled={!previousPage} aria-label={t("common.previous")}>
                    <ChevronLeftIcon className="h-4 w-4" />
                </Button>
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
                <Button type="button" variant="outline" size="icon" onClick={() => nextPage && onPageChange(nextPage)} disabled={!nextPage} aria-label={t("common.next")}>
                    <ChevronRightIcon className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" size="icon" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} aria-label={t("common.last")}>
                    <ChevronsRightIcon className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default Pagination;
