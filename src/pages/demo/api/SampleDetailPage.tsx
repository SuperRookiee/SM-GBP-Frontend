import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
    CreateSampleApi,
    DeleteSampleApi,
    GetSampleDetailApi,
    UpdateSampleApi,
    type ISampleApiItem,
    type ISampleUpsertPayload,
} from "@/apis/demo/sample.api.ts";
import { ApiResultEnum, ErrorResultCodeEnum, SuccessResultCodeEnum } from "@/enums/apiResult.enum.ts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FormState = {
    name: string;
    description: string;
    category: string;
    status: string;
    priority: string;
    quantity: string;
    price: string;
    rate: string;
    active: boolean;
    dueDate: string;
    memo: string;
};

type NoticeDialogState = {
    open: boolean;
    title: string;
    description: string;
    nextPath: string | null;
};

const EMPTY_FORM: FormState = {
    name: "",
    description: "",
    category: "",
    status: "ACTIVE",
    priority: "1",
    quantity: "0",
    price: "0",
    rate: "0",
    active: true,
    dueDate: "",
    memo: "",
};

const toFormState = (item: ISampleApiItem): FormState => ({
    name: item.name,
    description: item.description,
    category: item.category,
    status: item.status,
    priority: String(item.priority),
    quantity: String(item.quantity),
    price: String(item.price),
    rate: String(item.rate),
    active: item.active,
    dueDate: item.dueDate ?? "",
    memo: item.memo ?? "",
});

const toPayload = (form: FormState): ISampleUpsertPayload => ({
    name: form.name,
    description: form.description,
    category: form.category,
    status: form.status,
    priority: Number(form.priority || 0),
    quantity: Number(form.quantity || 0),
    price: Number(form.price || 0),
    rate: Number(form.rate || 0),
    active: form.active,
    dueDate: form.dueDate || null,
    memo: form.memo || null,
});

const SampleDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const sampleId = Number(id);
    const isCreateMode = Number.isNaN(sampleId);

    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [noticeDialog, setNoticeDialog] = useState<NoticeDialogState>({
        open: false,
        title: "",
        description: "",
        nextPath: null,
    });

    const openNoticeDialog = (title: string, description: string, nextPath: string | null = null) => {
        setNoticeDialog({ open: true, title, description, nextPath });
    };

    const closeNoticeDialog = () => {
        const nextPath = noticeDialog.nextPath;
        setNoticeDialog((prev) => ({ ...prev, open: false, nextPath: null }));
        if (nextPath) navigate(nextPath);
    };

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["sample", "detail", sampleId],
        queryFn: () => GetSampleDetailApi(sampleId),
        enabled: !isCreateMode,
    });

    const hasSuccess = data?.result === ApiResultEnum.SUCCESS && data.code === SuccessResultCodeEnum.OK;

    const resolvedError = useMemo(() => {
        if (isError) return error instanceof Error ? error.message : "요청 중 오류가 발생했습니다.";
        if (data?.result === ApiResultEnum.FAIL) return data.error?.detail ?? "요청이 실패했습니다.";
        return null;
    }, [data, error, isError]);

    const detailItem = hasSuccess ? data.data : null;

    useEffect(() => {
        if (!detailItem || isFormDirty) return;
        setForm(toFormState(detailItem));
    }, [detailItem, isFormDirty]);

    const upsertMutation = useMutation({
        mutationFn: async () => {
            const payload = toPayload(form);
            if (isCreateMode) {
                return CreateSampleApi(payload);
            }
            return UpdateSampleApi(sampleId, payload);
        },
        onSuccess: (response) => {
            if (!(response.result === ApiResultEnum.SUCCESS && response.code === SuccessResultCodeEnum.OK)) {
                openNoticeDialog("저장 실패", response.error?.detail ?? "저장에 실패했습니다.");
                return;
            }

            void queryClient.invalidateQueries({ queryKey: ["sample", "list"] });
            const nextPath = isCreateMode ? "/demo/api" : (typeof response.data?.id === "number" ? `/demo/api/${response.data.id}` : null);
            openNoticeDialog(
                "저장 완료",
                isCreateMode ? "등록되었습니다. 목록으로 이동합니다." : "수정되었습니다.",
                nextPath,
            );
            setIsFormDirty(false);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => DeleteSampleApi(sampleId),
        onSuccess: (response) => {
            if (!(response.result === ApiResultEnum.SUCCESS && response.code === SuccessResultCodeEnum.OK)) {
                openNoticeDialog("삭제 실패", response.error?.detail ?? "삭제에 실패했습니다.");
                return;
            }

            void queryClient.invalidateQueries({ queryKey: ["sample", "list"] });
            openNoticeDialog("삭제 완료", "삭제되었습니다.", "/demo/api");
        },
    });

    const onChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setIsFormDirty(true);
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="flex min-h-full min-w-0 items-center justify-center overflow-hidden">
            <div className="mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-6 overflow-hidden">
                <header className="space-y-2">
                    <div className="flex items-center justify-start">
                        <Button variant="outline" onClick={() => navigate("/demo/api")}>목록으로</Button>
                    </div>
                    <p className="text-sm font-semibold text-muted-foreground">Demo API</p>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        {isCreateMode ? "Sample 신규 등록" : `Sample 상세 (${sampleId})`}
                    </h1>
                    <p className="text-sm text-muted-foreground">/sample/orm CRUD 테스트 페이지입니다.</p>
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle>{isCreateMode ? "등록" : "조회/수정"}</CardTitle>
                        <CardDescription>필요한 값을 입력한 뒤 저장하세요.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {resolvedError && !isCreateMode ? (
                            <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                                [{data?.code ?? ErrorResultCodeEnum.INTERNAL_ERROR}] {resolvedError}
                            </p>
                        ) : null}

                        {isLoading && !isCreateMode ? (
                            <p className="text-sm text-muted-foreground">상세 데이터를 불러오는 중입니다...</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">이름</Label>
                                    <Input id="name" value={form.name} onChange={(event) => onChange("name", event.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">카테고리</Label>
                                    <Input id="category" value={form.category} onChange={(event) => onChange("category", event.target.value)} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="description">설명</Label>
                                    <Input id="description" value={form.description} onChange={(event) => onChange("description", event.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">상태</Label>
                                    <Input id="status" value={form.status} onChange={(event) => onChange("status", event.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dueDate">마감일</Label>
                                    <Input id="dueDate" type="date" value={form.dueDate} onChange={(event) => onChange("dueDate", event.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priority">우선순위</Label>
                                    <Input id="priority" type="number" value={form.priority} onChange={(event) => onChange("priority", event.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">수량</Label>
                                    <Input id="quantity" type="number" value={form.quantity} onChange={(event) => onChange("quantity", event.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">가격</Label>
                                    <Input id="price" type="number" value={form.price} onChange={(event) => onChange("price", event.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rate">비율</Label>
                                    <Input id="rate" type="number" step="0.01" value={form.rate} onChange={(event) => onChange("rate", event.target.value)} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="memo">메모</Label>
                                    <Textarea id="memo" value={form.memo} onChange={(event) => onChange("memo", event.target.value)} />
                                </div>
                                <label className="flex items-center gap-2 text-sm font-medium md:col-span-2">
                                    <input
                                        type="checkbox"
                                        checked={form.active}
                                        onChange={(event) => onChange("active", event.target.checked)}
                                    />
                                    활성 여부
                                </label>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={() => navigate("/demo/api")}>목록으로</Button>
                            <Button onClick={() => upsertMutation.mutate()} disabled={upsertMutation.isPending || isLoading}>
                                {isCreateMode ? "등록" : "수정"}
                            </Button>
                            {!isCreateMode ? (
                                <Button
                                    variant="destructive"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                    disabled={deleteMutation.isPending}
                                >
                                    삭제
                                </Button>
                            ) : null}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>삭제 확인</DialogTitle>
                        <DialogDescription>정말 삭제하시겠습니까?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>취소</Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setIsDeleteDialogOpen(false);
                                deleteMutation.mutate();
                            }}
                            disabled={deleteMutation.isPending}
                        >
                            삭제
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={noticeDialog.open} onOpenChange={(open) => {
                if (!open) closeNoticeDialog();
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{noticeDialog.title}</DialogTitle>
                        <DialogDescription>{noticeDialog.description}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={closeNoticeDialog}>확인</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SampleDetailPage;
