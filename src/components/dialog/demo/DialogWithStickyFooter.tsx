import { useTranslation } from "react-i18next";
import { Button } from '@/components/ui/button.tsx'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from '@/components/ui/dialog.tsx'

const DialogWithStickyFooter = () => {
    const { t } = useTranslation();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">{t("dialogDemo.stickyFooter.trigger")}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("dialogDemo.scrollable.title")}</DialogTitle>
                    <DialogDescription>{t("dialogDemo.scrollable.description")}</DialogDescription>
                </DialogHeader>
                <div className="style-nova:-mx-4 style-nova:px-4 no-scrollbar style-vega:px-6 style-mira:px-4 style-maia:px-6 style-vega:-mx-6 style-maia:-mx-6 style-mira:-mx-4 style-lyra:-mx-4 style-lyra:px-4 max-h-[70vh] overflow-y-auto">
                    {Array.from({ length: 10 }).map((_, index) => (
                        <p key={index} className="style-lyra:mb-2 style-lyra:leading-relaxed mb-4 leading-normal">
                            {t("dialogDemo.scrollable.paragraph")}
                        </p>
                    ))}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">{t("dialogDemo.common.close")}</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DialogWithStickyFooter;
