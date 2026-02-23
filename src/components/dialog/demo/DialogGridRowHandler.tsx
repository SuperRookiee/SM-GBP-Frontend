import { useTranslation } from "react-i18next";
import type { IDemoGridTableRow } from "@/interfaces/demo/IDemoGridTable.interface.ts";
import { Button } from "@/components/ui/button.tsx";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog.tsx";

interface IDialogGridRowHandlerProps {
    selectedRows: IDemoGridTableRow[];
}

const DialogGridRowHandler = ({ selectedRows }: IDialogGridRowHandlerProps) => {
    const { t } = useTranslation();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">{t("dialogGridRow.button")}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{t("dialogGridRow.title")}</DialogTitle>
                    <DialogDescription>{t("dialogGridRow.description")}</DialogDescription>
                </DialogHeader>

                {selectedRows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("dialogGridRow.empty")}</p>
                ) : (
                    <div className="max-h-80 space-y-2 overflow-y-auto rounded-md border p-3 text-left">
                        {selectedRows.map((row) => (
                            <pre key={row.id} className="whitespace-pre-wrap text-xs">
                                {JSON.stringify(row, null, 2)}
                            </pre>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default DialogGridRowHandler;
