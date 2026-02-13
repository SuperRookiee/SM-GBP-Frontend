import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SampleDeleteConfirmDialogProps {
    open: boolean;
    loading?: boolean;
    name?: string;
    onClose: () => void;
    onConfirm: () => void;
}

const SampleDeleteConfirmDialog = ({
    open,
    loading = false,
    name,
    onClose,
    onConfirm,
}: SampleDeleteConfirmDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Sample</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete <span className="font-medium text-foreground">{name}</span>?
                </p>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button variant="destructive" onClick={onConfirm} disabled={loading}>
                        {loading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default SampleDeleteConfirmDialog;
