import { useCallback, useEffect, useState } from "react";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from "@lexical/list";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { mergeRegister } from "@lexical/utils";
import {
    $getSelection,
    $isRangeSelection,
    COMMAND_PRIORITY_LOW,
    FORMAT_TEXT_COMMAND,
    SELECTION_CHANGE_COMMAND,
} from "lexical";
import type { EditorState, Klass, LexicalEditor, LexicalNode } from "lexical";
import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import "@/styles/demoEditor.css";

type TextFormat = "bold" | "italic" | "underline";

const theme = {
    paragraph: "editor-paragraph",
    quote: "editor-quote",
    text: {
        bold: "editor-text-bold",
        italic: "editor-text-italic",
        underline: "editor-text-underline",
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

type ToolbarButtonProps = {
    isActive?: boolean;
    onClick: () => void;
    label: string;
};

const ToolbarButton = ({ isActive = false, onClick, label }: ToolbarButtonProps) => {
    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn("min-w-10", isActive && "bg-primary text-primary-foreground")}
            onClick={onClick}
        >
            {label}
        </Button>
    );
};

const EditorToolbar = () => {
    const [editor] = useLexicalComposerContext();
    const [formats, setFormats] = useState<Record<TextFormat, boolean>>({
        bold: false,
        italic: false,
        underline: false,
    });

    const updateToolbar = useCallback(() => {
        editor.getEditorState().read(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                setFormats({
                    bold: selection.hasFormat("bold"),
                    italic: selection.hasFormat("italic"),
                    underline: selection.hasFormat("underline"),
                });
            }
        });
    }, [editor]);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(() => {
                updateToolbar();
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    updateToolbar();
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
        );
    }, [editor, updateToolbar]);

    return (
        <div className="flex flex-wrap gap-2 border-b px-4 py-3">
            <ToolbarButton label="B" isActive={formats.bold} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}/>
            <ToolbarButton label="I" isActive={formats.italic} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}/>
            <ToolbarButton label="U" isActive={formats.underline} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}/>
            <ToolbarButton label="• List" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}/>
            <ToolbarButton label="1. List" onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}/>
            <ToolbarButton label="Clear List" onClick={() => editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)}/>
        </div>
    );
};

const DemoEditor = () => {
    const [value, setValue] = useState("");

    const onChange = (editorState: EditorState, editor: LexicalEditor) => {
        editorState.read(() => {
            setValue(JSON.stringify(editor.toJSON(), null, 2));
        });
    };

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden">
                <LexicalComposer initialConfig={editorConfig}>
                    <EditorToolbar/>
                    <div className="editor-shell">
                        <RichTextPlugin
                            contentEditable={<ContentEditable className="editor-input"/>}
                            placeholder={<div className="editor-placeholder">내용을 입력해보세요...</div>}
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                        <HistoryPlugin/>
                        <AutoFocusPlugin/>
                        <ListPlugin/>
                        <LinkPlugin/>
                        <OnChangePlugin onChange={onChange}/>
                    </div>
                </LexicalComposer>
            </Card>

            <Card className="p-4">
                <h2 className="font-semibold mb-3">Lexical JSON Output</h2>
                <pre className="bg-muted rounded-md p-3 text-xs h-[360px] overflow-auto">{value || "{ }"}</pre>
            </Card>
        </div>
    );
};

const DemoEditorPage = () => {
    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Lexical Demo Editor</h1>
                <p className="text-muted-foreground mt-2">Lexical 기반의 기본 리치 텍스트 에디터 데모입니다.</p>
            </div>
            <DemoEditor/>
        </div>
    );
};

export default DemoEditorPage;
