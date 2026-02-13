import { useMemo, useState } from "react";
import { ApiRequestError, NetworkRequestError } from "@/apis/apiClient";
import {
    useCreateSample,
    useDeleteSample,
    useSampleList,
    useUpdateSample,
    useSearchSample,
} from "@/hooks/useSample";
import type { FieldError, SampleItem, SampleSearchParams } from "@/types/sample.types";
import SampleDeleteConfirmDialog from "@/components/sample/SampleDeleteConfirmDialog";
import SampleFormModal from "@/components/sample/SampleFormModal";
import SampleSearchFilters, { type SampleFilterValues } from "@/components/sample/SampleSearchFilters";
import SampleTable from "@/components/sample/SampleTable";
import { Button } from "@/components/ui/button";

const defaultFilter: SampleFilterValues = {
    name: "",
    category: "",
    status: "",
    active: "all",
};

const defaultPage = { page: 1, size: 10 };

const toSearchParams = (filter: SampleFilterValues, page: number, size: number): SampleSearchParams => ({
    page,
    size,
    ...(filter.name ? { name: filter.name } : {}),
    ...(filter.category ? { category: filter.category } : {}),
    ...(filter.status ? { status: filter.status } : {}),
    ...(filter.active !== "all" ? { active: filter.active === "true" } : {}),
});

const extractError = (error: unknown) => {
    if (error instanceof ApiRequestError) {
        return {
            detail: error.detail?.detail ?? error.message,
            fieldErrors: (error.detail?.fieldErrors ?? []) as FieldError[],
        };
    }

    if (error instanceof NetworkRequestError) {
        return { detail: error.message, fieldErrors: [] as FieldError[] };
    }

    if (error instanceof Error) {
        return { detail: error.message, fieldErrors: [] as FieldError[] };
    }

    return { detail: "Unknown error", fieldErrors: [] as FieldError[] };
};

const DemoApiPage = () => {
    const [page, setPage] = useState(defaultPage.page);
    const [size, setSize] = useState(defaultPage.size);
    const [draftFilter, setDraftFilter] = useState<SampleFilterValues>(defaultFilter);
    const [appliedFilter, setAppliedFilter] = useState<SampleFilterValues>(defaultFilter);
    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<SampleItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<SampleItem | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);

    const hasFilter = useMemo(
        () => Object.entries(appliedFilter).some(([key, value]) => key === "active" ? value !== "all" : Boolean(value)),
        [appliedFilter],
    );

    const params = useMemo(() => toSearchParams(appliedFilter, page, size), [appliedFilter, page, size]);

    const listQuery = useSampleList(params);
    const searchQuery = useSearchSample(params, hasFilter);
    const activeQuery = hasFilter ? searchQuery : listQuery;

    const createMutation = useCreateSample();
    const updateMutation = useUpdateSample();
    const deleteMutation = useDeleteSample();

    const pageData = activeQuery.data;
    const totalPages = Math.max(pageData?.totalPages ?? 1, 1);

    const handleQueryError = (error: unknown) => {
        const extracted = extractError(error);
        alert(extracted.detail);
        setFieldErrors(extracted.fieldErrors);
    };

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
            <header className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">Demo API</p>
                <h1 className="text-3xl font-semibold tracking-tight">Sample CRUD</h1>
                <p className="text-sm text-muted-foreground">/demo/api 에서 Sample CRUD를 제공합니다.</p>
            </header>

            <div className="flex justify-end">
                <Button onClick={() => { setFieldErrors([]); setCreateOpen(true); }}>Create</Button>
            </div>

            <SampleSearchFilters
                value={draftFilter}
                onChange={setDraftFilter}
                onSearch={() => {
                    setPage(1);
                    setAppliedFilter(draftFilter);
                }}
                onReset={() => {
                    setPage(1);
                    setDraftFilter(defaultFilter);
                    setAppliedFilter(defaultFilter);
                }}
            />

            {activeQuery.isError && (
                <p className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                    {extractError(activeQuery.error).detail}
                </p>
            )}

            <SampleTable
                rows={pageData?.content ?? []}
                loading={activeQuery.isPending || activeQuery.isFetching}
                onEdit={(item) => {
                    setFieldErrors([]);
                    setEditTarget(item);
                }}
                onDelete={setDeleteTarget}
            />

            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Page {page} / {totalPages} · Total {pageData?.totalElements ?? 0}
                </p>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page <= 1}>Prev</Button>
                    <Button variant="outline" onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} disabled={page >= totalPages}>Next</Button>
                    <select
                        className="h-9 rounded-md border bg-background px-2 text-sm"
                        value={size}
                        onChange={(event) => {
                            setPage(1);
                            setSize(Number(event.target.value));
                        }}
                    >
                        {[10, 20, 50].map((pageSize) => (
                            <option value={pageSize} key={pageSize}>{pageSize} / page</option>
                        ))}
                    </select>
                </div>
            </div>

            <SampleFormModal
                mode="create"
                open={createOpen}
                loading={createMutation.isPending}
                fieldErrors={fieldErrors}
                onClose={() => setCreateOpen(false)}
                onSubmit={(value) => {
                    setFieldErrors([]);
                    createMutation.mutate(value, {
                        onSuccess: () => {
                            setCreateOpen(false);
                            alert("Created successfully");
                        },
                        onError: handleQueryError,
                    });
                }}
            />

            <SampleFormModal
                mode="edit"
                open={Boolean(editTarget)}
                initialValue={editTarget ?? undefined}
                loading={updateMutation.isPending}
                fieldErrors={fieldErrors}
                onClose={() => setEditTarget(null)}
                onSubmit={(value) => {
                    if (!editTarget) return;
                    setFieldErrors([]);
                    updateMutation.mutate(
                        { id: editTarget.id, payload: value },
                        {
                            onSuccess: () => {
                                setEditTarget(null);
                                alert("Updated successfully");
                            },
                            onError: handleQueryError,
                        },
                    );
                }}
            />

            <SampleDeleteConfirmDialog
                open={Boolean(deleteTarget)}
                loading={deleteMutation.isPending}
                name={deleteTarget?.name}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => {
                    if (!deleteTarget) return;

                    deleteMutation.mutate(deleteTarget.id, {
                        onSuccess: () => {
                            setDeleteTarget(null);
                            alert("Deleted successfully");
                        },
                        onError: handleQueryError,
                    });
                }}
            />
        </div>
    );
};

export default DemoApiPage;
