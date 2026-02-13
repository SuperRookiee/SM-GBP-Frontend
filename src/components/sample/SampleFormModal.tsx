import { useEffect, useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FieldError, SampleFormValues, SampleItem } from "@/types/sample.types";

interface SampleFormModalProps {
    open: boolean;
    mode: "create" | "edit";
    initialValue?: SampleItem;
    loading?: boolean;
    fieldErrors?: FieldError[];
    onClose: () => void;
    onSubmit: (value: SampleFormValues) => void;
}

const emptyForm: SampleFormValues = {
    name: "",
    category: "",
    status: "",
    active: true,
    description: "",
};

const SampleFormModal = ({
    open,
    mode,
    initialValue,
    loading = false,
    fieldErrors,
    onClose,
    onSubmit,
}: SampleFormModalProps) => {
    const [formValue, setFormValue] = useState<SampleFormValues>(emptyForm);

    const fieldErrorMap = useMemo(() => {
        return (fieldErrors ?? []).reduce<Record<string, string>>((acc, item) => {
            acc[item.field] = item.reason;
            return acc;
        }, {});
    }, [fieldErrors]);

    useEffect(() => {
        if (!open) return;

        if (mode === "edit" && initialValue) {
            setFormValue({
                name: initialValue.name,
                category: initialValue.category,
                status: initialValue.status,
                active: initialValue.active,
                description: initialValue.description ?? "",
            });
            return;
        }

        setFormValue(emptyForm);
    }, [initialValue, mode, open]);

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "Create Sample" : "Edit Sample"}</DialogTitle>
                </DialogHeader>

                <form
                    className="grid gap-3"
                    onSubmit={(event) => {
                        event.preventDefault();
                        onSubmit(formValue);
                    }}
                >
                    <div className="grid gap-1">
                        <Label htmlFor="sample-name">Name</Label>
                        <Input
                            id="sample-name"
                            value={formValue.name}
                            onChange={(event) => setFormValue((prev) => ({ ...prev, name: event.target.value }))}
                            required
                        />
                        {fieldErrorMap.name && <p className="text-sm text-destructive">{fieldErrorMap.name}</p>}
                    </div>

                    <div className="grid gap-1">
                        <Label htmlFor="sample-category">Category</Label>
                        <Input
                            id="sample-category"
                            value={formValue.category}
                            onChange={(event) => setFormValue((prev) => ({ ...prev, category: event.target.value }))}
                            required
                        />
                        {fieldErrorMap.category && <p className="text-sm text-destructive">{fieldErrorMap.category}</p>}
                    </div>

                    <div className="grid gap-1">
                        <Label htmlFor="sample-status">Status</Label>
                        <Input
                            id="sample-status"
                            value={formValue.status}
                            onChange={(event) => setFormValue((prev) => ({ ...prev, status: event.target.value }))}
                            required
                        />
                        {fieldErrorMap.status && <p className="text-sm text-destructive">{fieldErrorMap.status}</p>}
                    </div>

                    <div className="grid gap-1">
                        <Label htmlFor="sample-active">Active (true / false)</Label>
                        <Input
                            id="sample-active"
                            value={String(formValue.active)}
                            onChange={(event) =>
                                setFormValue((prev) => ({
                                    ...prev,
                                    active: event.target.value.toLowerCase() === "true",
                                }))
                            }
                        />
                        {fieldErrorMap.active && <p className="text-sm text-destructive">{fieldErrorMap.active}</p>}
                    </div>

                    <div className="grid gap-1">
                        <Label htmlFor="sample-description">Description</Label>
                        <Input
                            id="sample-description"
                            value={formValue.description ?? ""}
                            onChange={(event) => setFormValue((prev) => ({ ...prev, description: event.target.value }))}
                        />
                        {fieldErrorMap.description && (
                            <p className="text-sm text-destructive">{fieldErrorMap.description}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SampleFormModal;
