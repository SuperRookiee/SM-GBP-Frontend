import { Button } from '@/components/ui/button.tsx'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from '@/components/ui/dialog.tsx'

const DialogNoCloseButton = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">No Close Button</Button>
            </DialogTrigger>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>No Close Button</DialogTitle>
                    <DialogDescription>
                        This dialog doesn&apos;t have a close button in the top-right
                        corner.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DialogNoCloseButton;