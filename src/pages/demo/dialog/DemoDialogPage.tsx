import type { ReactNode } from "react";
import DialogChatSettings from "@/components/dialog/demo/DialogChatSettings"
import DialogNoCloseButton from "@/components/dialog/demo/DialogNoCloseButton"
import DialogScrollableContent from "@/components/dialog/demo/DialogScrollableContent"
import DialogWithForm from "@/components/dialog/demo/DialogWithForm"
import DialogWithStickyFooter from "@/components/dialog/demo/DialogWithStickyFooter"

const DemoDialogPage = () => {
    const items: { title: string, node: ReactNode }[] = [
        { title: "With Form", node: <DialogWithForm/> },
        { title: "Scrollable Content", node: <DialogScrollableContent/> },
        { title: "With Sticky Footer", node: <DialogWithStickyFooter/> },
        { title: "No Close Button", node: <DialogNoCloseButton/> },
    ]

    return (
        <div className="p-10">
            <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
                {items.map(it =>
                    <DemoCard key={it.title} title={it.title}>
                        {it.node}
                    </DemoCard>
                )}
                <div className="md:col-span-1">
                    <DemoCard title="Chat Settings">
                        <DialogChatSettings/>
                    </DemoCard>
                </div>
            </div>
        </div>
    )
}

const DemoCard = ({ title, children }: { title: string; children: ReactNode }) => {
    return (
        <section className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <div className="h-28 w-full rounded-md border border-dashed border-muted-foreground/30 bg-background
                            flex items-center justify-center">
                {children}
            </div>
        </section>
    )
}

export default DemoDialogPage
