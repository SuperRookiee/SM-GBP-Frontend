import type { IDemoGridTableRow } from "@/interfaces/demo/IDemoGridTable.interface.ts";
import { Button } from "@/components/ui/button.tsx";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog.tsx";

interface IDialogGridRowHandlerProps {
    selectedRows: IDemoGridTableRow[];
}

const DialogGridRowHandler = ({ selectedRows }: IDialogGridRowHandlerProps) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">Row Handler</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>선택한 Row 정보</DialogTitle>
                    <DialogDescription>현재 AG Grid에서 선택된 Row 데이터를 표시합니다.</DialogDescription>
                </DialogHeader>

                {selectedRows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">선택된 Row 데이터가 없습니다.</p>
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
