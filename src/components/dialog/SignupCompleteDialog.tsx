import {Button} from "@/components/ui/button.tsx";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";

interface SignupCompleteDialogProps {
    open: boolean;
    title: string;
    description: string;
    lines: string[];
    confirmLabel: string;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
};

const SignupCompleteDialog = ({
    open,
    title,
    description,
    lines,
    confirmLabel,
    onOpenChange,
    onConfirm,
}: SignupCompleteDialogProps) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl">
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <p className="text-center text-base leading-7">
                {lines.map((line, index) => (
                    <span key={`${index}-${line}`}>
                        {line}
                        {index < lines.length - 1 ? <br/> : null}
                    </span>
                ))}
            </p>
            <DialogFooter className="sm:justify-center">
                <Button type="button" onClick={onConfirm}>{confirmLabel}</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

export default SignupCompleteDialog;

