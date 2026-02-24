import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateSampleApi, DeleteSampleApi, GetSampleDetailApi, UpdateSampleApi } from "@/apis/demo/sample.api.ts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiResultEnum, ErrorResultCodeEnum, SuccessResultCodeEnum } from "@/enums/apiResult.enum.ts";
import type { ISampleApiItem, ISampleUpsertPayload } from "@/interfaces/demo/ISample.interface.ts";

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
    const { t } = useTranslation();
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

// #. 알림 다이얼로그를 열고 메시지를 설정한다.
    const openNoticeDialog = (title: string, description: string, nextPath: string | null = null) => {
        setNoticeDialog({ open: true, title, description, nextPath });
    };

// #. 알림 다이얼로그를 닫고 후속 이동을 처리한다.
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
    const detailItem = hasSuccess ? data.data : null;
    const formValue = (!isCreateMode && !isFormDirty && detailItem) ? toFormState(detailItem) : form;

    const resolvedError = useMemo(() => {
        if (isError) return error instanceof Error ? error.message : t("sampleDetail.errorDuringRequest");
        if (data?.result === ApiResultEnum.FAIL) return data.error?.detail ?? t("sampleDetail.requestFailed");
        return null;
    }, [data, error, isError, t]);

    const upsertMutation = useMutation({
        mutationFn: async () => {
            const payload = toPayload(formValue);
            return isCreateMode ? CreateSampleApi(payload) : UpdateSampleApi(sampleId, payload);
        },
        onSuccess: (response) => {
            if (!(response.result === ApiResultEnum.SUCCESS && response.code === SuccessResultCodeEnum.OK)) {
                openNoticeDialog(t("sampleDetail.saveFailedTitle"), response.error?.detail ?? t("sampleDetail.saveFailed"));
                return;
            }
            void queryClient.invalidateQueries({ queryKey: ["sample", "list"] });
            void queryClient.invalidateQueries({ queryKey: ["sample", "detail", sampleId] });
            openNoticeDialog(t("sampleDetail.saveDoneTitle"), t("sampleDetail.saveDone"));
            setIsFormDirty(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: () => DeleteSampleApi(sampleId),
        onSuccess: (response) => {
            if (!(response.result === ApiResultEnum.SUCCESS && response.code === SuccessResultCodeEnum.OK)) {
                openNoticeDialog(t("sampleDetail.deleteFailedTitle"), response.error?.detail ?? t("sampleDetail.deleteFailed"));
                return;
            }
            void queryClient.invalidateQueries({ queryKey: ["sample", "list"] });
            openNoticeDialog(t("sampleDetail.deleteDoneTitle"), t("sampleDetail.deleteDone"), "/demo/api");
        },
    });

// #. 입력 폼 값 변경 이벤트를 처리한다.
const onChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        if (!isFormDirty) {
            setForm({ ...formValue, [key]: value });
            setIsFormDirty(true);
        } else {
            setForm((prev) => ({ ...prev, [key]: value }));
        }
    };

    return (
        <div className="flex min-h-full min-w-0 items-center justify-center overflow-hidden">
            <div className="mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-6 overflow-hidden">
                <header className="space-y-2">
                    <div className="flex items-center justify-start">
                        <Button variant="outline" onClick={() => navigate("/demo/api")}>{t("sampleDetail.backToList")}</Button>
                    </div>
                    <p className="text-sm font-semibold text-muted-foreground">{t("sampleDetail.section")}</p>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        {isCreateMode ? t("sampleDetail.createTitle") : t("sampleDetail.detailTitle", { id: sampleId })}
                    </h1>
                    <p className="text-sm text-muted-foreground">{t("sampleDetail.pageDescription")}</p>
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle>{isCreateMode ? t("sampleDetail.create") : t("sampleDetail.edit")}</CardTitle>
                        <CardDescription>{t("sampleDetail.cardDescription")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {resolvedError && !isCreateMode ? (
                            <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                                [{data?.code ?? ErrorResultCodeEnum.INTERNAL_ERROR}] {resolvedError}
                            </p>
                        ) : null}

                        {isLoading && !isCreateMode ? (
                            <p className="text-sm text-muted-foreground">{t("sampleDetail.loading")}</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">{t("table.name")}</Label>
                                    <Input id="name" value={formValue.name} onChange={(e) => onChange("name", e.target.value)}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">{t("table.category")}</Label>
                                    <Input id="category" value={formValue.category} onChange={(e) => onChange("category", e.target.value)}/>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="description">{t("table.description")}</Label>
                                    <Input id="description" value={formValue.description} onChange={(e) => onChange("description", e.target.value)}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">{t("table.status")}</Label>
                                    <Input id="status" value={formValue.status} onChange={(e) => onChange("status", e.target.value)}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dueDate">{t("table.dueDate")}</Label>
                                    <Input id="dueDate" type="date" value={formValue.dueDate} onChange={(e) => onChange("dueDate", e.target.value)}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priority">{t("table.priority")}</Label>
                                    <Input id="priority" type="number" value={formValue.priority} onChange={(e) => onChange("priority", e.target.value)}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">{t("table.quantity")}</Label>
                                    <Input id="quantity" type="number" value={formValue.quantity} onChange={(e) => onChange("quantity", e.target.value)}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">{t("table.price")}</Label>
                                    <Input id="price" type="number" value={formValue.price} onChange={(e) => onChange("price", e.target.value)}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rate">{t("table.rate")}</Label>
                                    <Input id="rate" type="number" step="0.01" value={formValue.rate} onChange={(e) => onChange("rate", e.target.value)}/>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="memo">{t("table.memo")}</Label>
                                    <Textarea id="memo" value={formValue.memo} onChange={(e) => onChange("memo", e.target.value)}/>
                                </div>
                                <label className="flex items-center gap-2 text-sm font-medium md:col-span-2">
                                    <input type="checkbox" checked={formValue.active} onChange={(e) => onChange("active", e.target.checked)} />
                                    {t("sampleDetail.activeLabel")}
                                </label>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={() => navigate("/demo/api")}>{t("sampleDetail.backToList")}</Button>
                            <Button onClick={() => upsertMutation.mutate()} disabled={upsertMutation.isPending || (isLoading && !isCreateMode)}>
                                {isCreateMode ? t("sampleDetail.create") : t("sampleDetail.edit")}
                            </Button>
                            {!isCreateMode ? (
                                <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} disabled={deleteMutation.isPending}>
                                    {t("table.remove")}
                                </Button>
                            ) : null}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("sampleDetail.deleteConfirmTitle")}</DialogTitle>
                        <DialogDescription>{t("sampleDetail.deleteConfirmDescription")}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>{t("sampleDetail.cancel")}</Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setIsDeleteDialogOpen(false);
                                deleteMutation.mutate();
                            }}
                            disabled={deleteMutation.isPending}
                        >
                            {t("table.remove")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={noticeDialog.open} onOpenChange={(open) => !open && closeNoticeDialog()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{noticeDialog.title}</DialogTitle>
                        <DialogDescription>{noticeDialog.description}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={closeNoticeDialog}>{t("sampleDetail.confirm")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SampleDetailPage;

