import {Button} from "@/components/ui/button.tsx";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";

interface AgreementTermDialogProps {
    open: boolean;
    title: string;
    description: string;
    body: string[];
    confirmLabel: string;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
};

const AgreementTermDialog = ({
    open,
    title,
    description,
    body,
    confirmLabel,
    onOpenChange,
    onConfirm,
}: AgreementTermDialogProps) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[80svh] overflow-auto sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm leading-6">
                {body.map((line) => <p key={line}>{line}</p>)}
            </div>
            <DialogFooter>
                <Button type="button" onClick={onConfirm}>{confirmLabel}</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

export default AgreementTermDialog;

