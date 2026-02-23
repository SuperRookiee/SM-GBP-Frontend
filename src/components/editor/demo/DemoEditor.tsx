import { useCallback, useEffect, useState } from "react";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { $isListItemNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, ListItemNode, ListNode, REMOVE_LIST_COMMAND, } from "@lexical/list";
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
import { $createHeadingNode, HeadingNode, QuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { mergeRegister } from "@lexical/utils";
import type { EditorState, ElementFormatType, Klass, LexicalEditor, LexicalNode } from "lexical";
import { $createParagraphNode, $getSelection, $isRangeSelection, CAN_REDO_COMMAND, CAN_UNDO_COMMAND, COMMAND_PRIORITY_LOW, FORMAT_ELEMENT_COMMAND, FORMAT_TEXT_COMMAND, INDENT_CONTENT_COMMAND, KEY_TAB_COMMAND, OUTDENT_CONTENT_COMMAND, REDO_COMMAND, SELECTION_CHANGE_COMMAND, UNDO_COMMAND, } from "lexical";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Redo2, Undo2 } from "lucide-react";
import ToolbarButton from "@/components/editor/ToolbarButton.tsx";
import { Card } from "@/components/ui/card.tsx";
import "@/styles/demoEditor.css";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";

type TextFormat = "bold" | "italic" | "underline";

const theme = {
    paragraph: "editor-paragraph",
    quote: "editor-quote",
    list: {
        ul: "editor-list-ul",
        ol: "editor-list-ol",
        listitem: "editor-list-item",
    },
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

const isSelectionInList = () => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection)) {
        return false;
    }

    const anchorNode = selection.anchor.getNode();

    return $isListItemNode(anchorNode) || anchorNode.getParents().some((node) => $isListItemNode(node));
};

const TabIndentListPlugin = () => {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerCommand(
            KEY_TAB_COMMAND,
            (event) => {
                if (!event || !isSelectionInList()) {
                    return false;
                }

                event.preventDefault();

                editor.dispatchCommand(event.shiftKey ? OUTDENT_CONTENT_COMMAND : INDENT_CONTENT_COMMAND, undefined);
                return true;
            },
            COMMAND_PRIORITY_LOW,
        );
    }, [editor]);

    return null;
};

const EditorToolbar = () => {
    const [editor] = useLexicalComposerContext();
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
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

    const applyAlign = (alignType: ElementFormatType) => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignType);
    };

    const applyHeading = (headingType: "h1" | "h2" | "paragraph") => {
        editor.update(() => {
            const selection = $getSelection();

            if (!$isRangeSelection(selection)) {
                return;
            }

            if (headingType === "paragraph") {
                $setBlocksType(selection, () => $createParagraphNode());
                return;
            }

            $setBlocksType(selection, () => $createHeadingNode(headingType));
        });
    };

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
            editor.registerCommand(
                CAN_UNDO_COMMAND,
                (payload) => {
                    setCanUndo(payload);
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                CAN_REDO_COMMAND,
                (payload) => {
                    setCanRedo(payload);
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
        );
    }, [editor, updateToolbar]);

    return (
        <div className="flex flex-wrap gap-2 border-b px-4 py-3">
            <ToolbarButton label="뒤로" icon={<Undo2 size={14}/>} disabled={!canUndo}
                           onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}/>
            <ToolbarButton label="앞으로" icon={<Redo2 size={14}/>} disabled={!canRedo}
                           onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}/>
            <ToolbarButton label="B" isActive={formats.bold}
                           onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}/>
            <ToolbarButton label="I" isActive={formats.italic}
                           onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}/>
            <ToolbarButton label="U" isActive={formats.underline}
                           onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}/>
            <ToolbarButton label="H1" onClick={() => applyHeading("h1")}/>
            <ToolbarButton label="H2" onClick={() => applyHeading("h2")}/>
            <ToolbarButton label="본문" onClick={() => applyHeading("paragraph")}/>
            <ToolbarButton label="왼쪽" icon={<AlignLeft size={14}/>} onClick={() => applyAlign("left")}/>
            <ToolbarButton label="가운데" icon={<AlignCenter size={14}/>} onClick={() => applyAlign("center")}/>
            <ToolbarButton label="오른쪽" icon={<AlignRight size={14}/>} onClick={() => applyAlign("right")}/>
            <ToolbarButton label="양쪽" icon={<AlignJustify size={14}/>} onClick={() => applyAlign("justify")}/>
            <ToolbarButton label="• List"
                           onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}/>
            <ToolbarButton label="1. List"
                           onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}/>
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
                            contentEditable={<ContentEditable className="editor-input" aria-label="Demo editor input"/>}
                            placeholder={<div className="editor-placeholder">내용을 입력해보세요...</div>}
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                        <HistoryPlugin/>
                        <AutoFocusPlugin/>
                        <ListPlugin/>
                        <TabIndentListPlugin/>
                        <LinkPlugin/>
                        <OnChangePlugin onChange={onChange}/>
                    </div>
                </LexicalComposer>
            </Card>

            <Card className="p-4">
                <h2 className="mb-3 font-semibold">Lexical JSON Output</h2>
                <ScrollArea className="h-120">
                    <pre className="bg-muted overflow-auto rounded-md p-3 text-xs">{value || "{ }"}</pre>
                </ScrollArea>
            </Card>
        </div>
    );
};

export default DemoEditor;
