import { useTranslation } from "react-i18next";
import { Button } from '@/components/ui/button.tsx'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from '@/components/ui/dialog.tsx'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field.tsx'
import { Input } from '@/components/ui/input.tsx'

const DialogWithForm = () => {
    const { t } = useTranslation();

    return (
        <Dialog>
            <form>
                <DialogTrigger asChild>
                    <Button variant="outline">{t("dialogDemo.form.trigger")}</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("dialogDemo.form.title")}</DialogTitle>
                        <DialogDescription>{t("dialogDemo.form.description")}</DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="name-1">{t("table.name")}</FieldLabel>
                            <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="username-1">{t("dialogDemo.form.username")}</FieldLabel>
                            <Input id="username-1" name="username" defaultValue="@peduarte" />
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{t("sampleDetail.cancel")}</Button>
                        </DialogClose>
                        <Button type="submit">{t("dialogDemo.form.save")}</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}

export default DialogWithForm;
