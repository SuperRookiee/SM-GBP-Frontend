import { useTranslation } from "react-i18next";
import { Button } from '@/components/ui/button.tsx'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from '@/components/ui/dialog.tsx'

const DialogNoCloseButton = () => {
    const { t } = useTranslation();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">{t("dialogDemo.noClose.trigger")}</Button>
            </DialogTrigger>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>{t("dialogDemo.noClose.title")}</DialogTitle>
                    <DialogDescription>{t("dialogDemo.noClose.description")}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">{t("dialogDemo.common.close")}</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DialogNoCloseButton;
