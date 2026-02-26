import {useRef, useState} from "react";
import {AutoLinkNode, LinkNode} from "@lexical/link";
import {ListItemNode, ListNode} from "@lexical/list";
import {AutoFocusPlugin} from "@lexical/react/LexicalAutoFocusPlugin";
import {LexicalComposer} from "@lexical/react/LexicalComposer";
import {ContentEditable} from "@lexical/react/LexicalContentEditable";
import {LexicalErrorBoundary} from "@lexical/react/LexicalErrorBoundary";
import {HistoryPlugin} from "@lexical/react/LexicalHistoryPlugin";
import {LinkPlugin} from "@lexical/react/LexicalLinkPlugin";
import {ListPlugin} from "@lexical/react/LexicalListPlugin";
import {OnChangePlugin} from "@lexical/react/LexicalOnChangePlugin";
import {RichTextPlugin} from "@lexical/react/LexicalRichTextPlugin";
import {HeadingNode, QuoteNode} from "@lexical/rich-text";
import type {EditorState, Klass, LexicalEditor, LexicalNode} from "lexical";
import {useTranslation} from "react-i18next";
import BlockSideActions from "@/components/editor/BlockSideActions.tsx";
import ListTabIndentationPlugin from "@/components/editor/ListTabIndentationPlugin.tsx";
import ToolbarPlugin from "@/components/editor/ToolbarPlugin.tsx";
import {Card} from "@/components/ui/card.tsx";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import "@/styles/demoEditor.module.css";

const theme = {
    paragraph: "editor-paragraph",
    quote: "editor-quote",
    heading: {
        h1: "editor-heading-h1",
        h2: "editor-heading-h2",
        h3: "editor-heading-h3",
    },
    list: {
        ul: "editor-list-ul",
        ol: "editor-list-ol",
        listitem: "editor-list-item",
    },
    text: {
        bold: "editor-text-bold",
        italic: "editor-text-italic",
        underline: "editor-text-underline",
        strikethrough: "editor-text-strikethrough",
        subscript: "editor-text-subscript",
        superscript: "editor-text-superscript",
        code: "editor-text-code",
    },
};

const nodes: Array<Klass<LexicalNode>> = [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode];

const editorConfig = {
    namespace: "DemoEditor",
    theme,
    nodes,
    onError: (error: Error) => {
        throw error;
    },
};

const DemoEditorPage = () => {
    const {t} = useTranslation();
    const [value, setValue] = useState("");
    const shellRef = useRef<HTMLDivElement>(null);

    const onChange = (editorState: EditorState, editor: LexicalEditor) => {
        editorState.read(() => {
            setValue(JSON.stringify(editor.toJSON(), null, 2));
        });
    };

    return (
        <div className="space-y-6 p-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t("editorPage.title")}</h1>
                <p className="mt-2 text-muted-foreground">{t("editorPage.description")}</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
                {/* 에디터 */}
                <Card className="overflow-hidden pt-0 lg:col-span-2">
                    <LexicalComposer initialConfig={editorConfig}>
                        <ToolbarPlugin/>
                        <div className="editor-shell" ref={shellRef}>
                            <BlockSideActions shellRef={shellRef}/>
                            <RichTextPlugin
                                contentEditable={<ContentEditable className="editor-input" aria-label={t("editor.inputAria")}/>}
                                placeholder={<div className="editor-placeholder">{t("editor.placeholder")}</div>}
                                ErrorBoundary={LexicalErrorBoundary}
                            />
                            <HistoryPlugin/>
                            <AutoFocusPlugin/>
                            <ListPlugin/>
                            <ListTabIndentationPlugin/>
                            <LinkPlugin/>
                            <OnChangePlugin onChange={onChange}/>
                        </div>
                    </LexicalComposer>
                </Card>

                {/* 에디터 출력 JSON */}
                <Card className="p-4 lg:col-span-1">
                    <h2 className="font-semibold">{t("editor.jsonOutput")}</h2>
                    <ScrollArea className="h-120">
                        <pre className="overflow-auto rounded-md bg-muted p-3 text-xs">{value || "{ }"}</pre>
                    </ScrollArea>
                </Card>
            </div>
        </div>
    );
};

export default DemoEditorPage;
