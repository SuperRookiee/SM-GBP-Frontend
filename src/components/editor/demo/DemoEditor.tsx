import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {AutoLinkNode, LinkNode} from "@lexical/link";
import {$isListItemNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, ListItemNode, ListNode, REMOVE_LIST_COMMAND} from "@lexical/list";
import {AutoFocusPlugin} from "@lexical/react/LexicalAutoFocusPlugin";
import {LexicalComposer} from "@lexical/react/LexicalComposer";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {ContentEditable} from "@lexical/react/LexicalContentEditable";
import {LexicalErrorBoundary} from "@lexical/react/LexicalErrorBoundary";
import {HistoryPlugin} from "@lexical/react/LexicalHistoryPlugin";
import {LinkPlugin} from "@lexical/react/LexicalLinkPlugin";
import {ListPlugin} from "@lexical/react/LexicalListPlugin";
import {OnChangePlugin} from "@lexical/react/LexicalOnChangePlugin";
import {RichTextPlugin} from "@lexical/react/LexicalRichTextPlugin";
import {$createHeadingNode, $isHeadingNode, HeadingNode, QuoteNode} from "@lexical/rich-text";
import {$getSelectionStyleValueForProperty, $patchStyleText, $setBlocksType} from "@lexical/selection";
import {mergeRegister} from "@lexical/utils";
import type {EditorState, ElementFormatType, Klass, LexicalEditor, LexicalNode} from "lexical";
import {$createParagraphNode, $getNodeByKey, $getRoot, $getSelection, $isRangeSelection, CAN_REDO_COMMAND, CAN_UNDO_COMMAND, COMMAND_PRIORITY_LOW, FORMAT_ELEMENT_COMMAND, FORMAT_TEXT_COMMAND, INDENT_CONTENT_COMMAND, KEY_TAB_COMMAND, OUTDENT_CONTENT_COMMAND, REDO_COMMAND, SELECTION_CHANGE_COMMAND, UNDO_COMMAND,} from "lexical";
import {AlignLeft, ChevronDown, GripVertical, Heading, Highlighter, Image, Indent, Italic, List, ListChecks, ListOrdered, Minus, Plus, Quote, Redo2, Text, Underline, Undo2,} from "lucide-react";
import {useTranslation} from "react-i18next";
import {cn} from "@/utils/utils.ts";
import {Button} from "@/components/ui/button.tsx";
import {Card} from "@/components/ui/card.tsx";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import "@/styles/demoEditor.css";

type TextFormat = "bold" | "italic" | "underline";
type BlockType = "paragraph" | "h1" | "h2" | "h3" | "quote";
type InsertBlockType = "paragraph" | "h1" | "h2" | "h3" | "quote";

const fontOptions = ["Arial", "Georgia", "Times New Roman", "Courier New", "Verdana", "Trebuchet MS"];
const textColors = ["#000000", "#4b5563", "#ef4444", "#f59e0b", "#22c55e", "#0ea5e9", "#a855f7", "#ffffff"];

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

const toolbarButtonClass = "demo-editor-toolbar-button";

const EditorToolbar = () => {
    const [editor] = useLexicalComposerContext();
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [formats, setFormats] = useState<Record<TextFormat, boolean>>({bold: false, italic: false, underline: false});
    const [blockType, setBlockType] = useState<BlockType>("paragraph");
    const [fontFamily, setFontFamily] = useState("Arial");
    const [fontSize, setFontSize] = useState(15);
    const [textColor, setTextColor] = useState("#000000");

    const blockLabel = useMemo(() => {
        if (blockType === "h1") return "Heading 1";
        if (blockType === "h2") return "Heading 2";
        if (blockType === "h3") return "Heading 3";
        if (blockType === "quote") return "Quote";
        return "Normal";
    }, [blockType]);

    const updateToolbar = useCallback(() => {
        editor.getEditorState().read(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) {
                return;
            }

            const topLevelNode = selection.anchor.getNode().getTopLevelElementOrThrow();
            const headingType = $isHeadingNode(topLevelNode) ? topLevelNode.getTag() : undefined;

            setBlockType(
                headingType === "h1" || headingType === "h2" || headingType === "h3"
                    ? headingType
                    : topLevelNode.getType() === "quote"
                        ? "quote"
                        : "paragraph",
            );
            setFormats({
                bold: selection.hasFormat("bold"),
                italic: selection.hasFormat("italic"),
                underline: selection.hasFormat("underline"),
            });

            setFontFamily($getSelectionStyleValueForProperty(selection, "font-family", "Arial").replaceAll("\"", ""));
            const resolvedSize = Number.parseInt($getSelectionStyleValueForProperty(selection, "font-size", "15px"), 10);
            setFontSize(Number.isNaN(resolvedSize) ? 15 : resolvedSize);
            setTextColor($getSelectionStyleValueForProperty(selection, "color", "#000000"));
        });
    }, [editor]);

    const applyHeading = (type: BlockType) => {
        editor.update(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return;

            if (type === "paragraph") {
                $setBlocksType(selection, () => $createParagraphNode());
                return;
            }

            if (type === "h1" || type === "h2" || type === "h3") {
                $setBlocksType(selection, () => $createHeadingNode(type));
                return;
            }

            $setBlocksType(selection, () => new QuoteNode());
        });
    };

    const applyAlign = (alignType: ElementFormatType) => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignType);
    };

    const applyTextStyle = (styles: Record<string, string>) => {
        editor.update(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return;
            $patchStyleText(selection, styles);
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
        <div className="demo-editor-toolbar">
            <div className="demo-editor-toolbar-group">
                <Button variant="ghost" size="icon-sm" className={toolbarButtonClass} disabled={!canUndo}
                        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}>
                    <Undo2 size={16}/>
                </Button>
                <Button variant="ghost" size="icon-sm" className={toolbarButtonClass} disabled={!canRedo}
                        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}>
                    <Redo2 size={16}/>
                </Button>
            </div>

            <div className="demo-editor-toolbar-group">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="demo-editor-toolbar-trigger min-w-40 justify-between">
                            <span className="inline-flex items-center gap-2"><Heading size={15}/>{blockLabel}</span>
                            <ChevronDown size={15}/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-56">
                        <DropdownMenuItem
                            onClick={() => applyHeading("paragraph")}>Normal <DropdownMenuShortcut>Ctrl+Alt+0</DropdownMenuShortcut></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => applyHeading("h1")}>Heading
                            1 <DropdownMenuShortcut>Ctrl+Alt+1</DropdownMenuShortcut></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => applyHeading("h2")}>Heading
                            2 <DropdownMenuShortcut>Ctrl+Alt+2</DropdownMenuShortcut></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => applyHeading("h3")}>Heading
                            3 <DropdownMenuShortcut>Ctrl+Alt+3</DropdownMenuShortcut></DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => applyHeading("quote")}>Quote <DropdownMenuShortcut>Ctrl+Shift+Q</DropdownMenuShortcut></DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="demo-editor-toolbar-trigger min-w-32 justify-between">
                            <span className="truncate">{fontFamily}</span>
                            <ChevronDown size={15}/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-56">
                        {fontOptions.map((font) => (
                            <DropdownMenuItem key={font} onClick={() => applyTextStyle({"font-family": font})} style={{fontFamily: font}}>
                                {font}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="demo-editor-font-size-control">
                    <Button variant="ghost" size="icon-sm" className={toolbarButtonClass}
                            onClick={() => applyTextStyle({"font-size": `${Math.max(10, fontSize - 1)}px`})}><Minus size={15}/></Button>
                    <div className="demo-editor-font-size-value">{fontSize}</div>
                    <Button variant="ghost" size="icon-sm" className={toolbarButtonClass}
                            onClick={() => applyTextStyle({"font-size": `${Math.min(72, fontSize + 1)}px`})}><Plus size={15}/></Button>
                </div>
            </div>

            <div className="demo-editor-toolbar-group">
                <Button variant="ghost" size="icon-sm" className={cn(toolbarButtonClass, formats.bold && "is-active")}
                        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}><Text size={15} strokeWidth={3}/></Button>
                <Button variant="ghost" size="icon-sm" className={cn(toolbarButtonClass, formats.italic && "is-active")}
                        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}><Italic size={15}/></Button>
                <Button variant="ghost" size="icon-sm" className={cn(toolbarButtonClass, formats.underline && "is-active")}
                        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}><Underline size={15}/></Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className={toolbarButtonClass}><List size={15}/></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}><ListChecks
                            size={15}/> Bullet List</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}><ListOrdered
                            size={15}/> Numbered List</DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={() => editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)}>Clear
                            List</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className={toolbarButtonClass}><span className="demo-editor-color-icon"
                                                                                                    style={{color: textColor}}>A</span></Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="demo-editor-color-popover">
                        <div className="demo-editor-color-grid">
                            {textColors.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    className="demo-editor-color-swatch"
                                    style={{backgroundColor: color}}
                                    onClick={() => applyTextStyle({color})}
                                />
                            ))}
                        </div>
                        <div className="demo-editor-color-sample" style={{background: `linear-gradient(to right, #000, ${textColor})`}}/>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="demo-editor-toolbar-group">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="demo-editor-toolbar-trigger min-w-34 justify-between">
                            <span className="inline-flex items-center gap-2"><AlignLeft size={15}/>Left Align</span>
                            <ChevronDown size={15}/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-52">
                        <DropdownMenuItem onClick={() => applyAlign("left")}>Left
                            Align <DropdownMenuShortcut>Ctrl+Shift+L</DropdownMenuShortcut></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => applyAlign("center")}>Center
                            Align <DropdownMenuShortcut>Ctrl+Shift+E</DropdownMenuShortcut></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => applyAlign("right")}>Right
                            Align <DropdownMenuShortcut>Ctrl+Shift+R</DropdownMenuShortcut></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => applyAlign("justify")}>Justify
                            Align <DropdownMenuShortcut>Ctrl+Shift+J</DropdownMenuShortcut></DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)}><Indent size={15}
                                                                                                                             className="rotate-180"/>Outdent</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)}><Indent size={15}/>Indent</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="demo-editor-toolbar-trigger min-w-26 justify-between">
                            <span className="inline-flex items-center gap-2"><Plus size={15}/>Insert</span>
                            <ChevronDown size={15}/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-52">
                        <DropdownMenuItem><Minus size={15}/>Horizontal Rule</DropdownMenuItem>
                        <DropdownMenuItem><Image size={15}/>Image</DropdownMenuItem>
                        <DropdownMenuItem><Highlighter size={15}/>GIF</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

const BlockSideActions = ({shellRef}: { shellRef: React.RefObject<HTMLDivElement | null> }) => {
    const [editor] = useLexicalComposerContext();
    const [activeBlockKey, setActiveBlockKey] = useState<string | null>(null);
    const [blockTop, setBlockTop] = useState(0);
    const [isDraggingBlock, setIsDraggingBlock] = useState(false);
    const [dragGuideTop, setDragGuideTop] = useState<number | null>(null);
    const dragStateRef = useRef<{
        blockKey: string | null;
        lastClientY: number;
        active: boolean;
        dropTargetKey: string | null;
        dropPosition: "before" | "after";
    }>({
        blockKey: null,
        lastClientY: 0,
        active: false,
        dropTargetKey: null,
        dropPosition: "before",
    });

    const syncBlockPosition = useCallback(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
            setActiveBlockKey(null);
            return;
        }

        const topLevelNode = selection.anchor.getNode().getTopLevelElementOrThrow();
        const key = topLevelNode.getKey();
        const blockElement = editor.getElementByKey(key);

        if (!blockElement || !shellRef.current) {
            setActiveBlockKey(null);
            return;
        }

        const shellRect = shellRef.current.getBoundingClientRect();
        const blockRect = blockElement.getBoundingClientRect();

        setActiveBlockKey(key);
        setBlockTop(blockRect.top - shellRect.top);
    }, [editor, shellRef]);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({editorState}) => {
                editorState.read(() => {
                    syncBlockPosition();
                });
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    syncBlockPosition();
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
        );
    }, [editor, syncBlockPosition]);

    const insertBlockAfter = (type: InsertBlockType) => {
        editor.update(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return;

            const currentBlock = selection.anchor.getNode().getTopLevelElementOrThrow();
            const newNode = type === "paragraph"
                ? $createParagraphNode()
                : type === "quote"
                    ? new QuoteNode()
                    : $createHeadingNode(type);

            currentBlock.insertAfter(newNode);
            newNode.selectStart();
        });
    };

    const moveBlockByDropTarget = useCallback((blockKey: string, targetKey: string, position: "before" | "after") => {
        let moved = false;

        editor.update(() => {
            const blockNode = $getNodeByKey(blockKey);
            const targetNode = $getNodeByKey(targetKey);
            if (!blockNode || !targetNode) return;

            const currentBlock = blockNode.getTopLevelElementOrThrow();
            const targetBlock = targetNode.getTopLevelElementOrThrow();
            if (currentBlock.getKey() === targetBlock.getKey()) return;

            if (position === "before") targetBlock.insertBefore(currentBlock);
            else targetBlock.insertAfter(currentBlock);
            currentBlock.selectStart();
            moved = true;
        });

        return moved;
    }, [editor]);

    const resolveDropTargetFromPointer = useCallback((clientY: number) => {
        if (!shellRef.current) return;

        const shellRect = shellRef.current.getBoundingClientRect();
        const blockLayouts: Array<{ key: string; rect: DOMRect }> = [];

        editor.getEditorState().read(() => {
            const blocks = $getRoot().getChildren();

            blocks.forEach((block) => {
                const blockElement = editor.getElementByKey(block.getKey());
                if (!blockElement) return;
                blockLayouts.push({key: block.getKey(), rect: blockElement.getBoundingClientRect()});
            });
        });

        if (blockLayouts.length === 0) return;

        let targetKey = blockLayouts[blockLayouts.length - 1].key;
        let dropPosition: "before" | "after" = "after";
        let guideTop = blockLayouts[blockLayouts.length - 1].rect.bottom - shellRect.top;

        for (const block of blockLayouts) {
            const midpoint = block.rect.top + block.rect.height / 2;
            if (clientY < midpoint) {
                targetKey = block.key;
                dropPosition = "before";
                guideTop = block.rect.top - shellRect.top;
                break;
            }
        }

        dragStateRef.current.dropTargetKey = targetKey;
        dragStateRef.current.dropPosition = dropPosition;
        setDragGuideTop(guideTop);
    }, [editor, shellRef]);

    const stopDragging = useCallback(() => {
        if (!dragStateRef.current.active) return;

        dragStateRef.current = {blockKey: null, lastClientY: 0, active: false, dropTargetKey: null, dropPosition: "before"};
        setIsDraggingBlock(false);
        setDragGuideTop(null);
        document.body.style.userSelect = "";
    }, []);

    const onDragPointerMove = useCallback((event: PointerEvent) => {
        const dragState = dragStateRef.current;
        if (!dragState.active || !dragState.blockKey) return;

        dragState.lastClientY = event.clientY;
        resolveDropTargetFromPointer(event.clientY);
    }, [resolveDropTargetFromPointer]);

    const onDragPointerUp = useCallback(() => {
        const {blockKey, dropTargetKey, dropPosition} = dragStateRef.current;
        if (blockKey && dropTargetKey) {
            moveBlockByDropTarget(blockKey, dropTargetKey, dropPosition);
        }
        stopDragging();
    }, [moveBlockByDropTarget, stopDragging]);

    useEffect(() => {
        if (!isDraggingBlock) return;

        window.addEventListener("pointermove", onDragPointerMove);
        window.addEventListener("pointerup", onDragPointerUp);
        window.addEventListener("pointercancel", onDragPointerUp);

        return () => {
            window.removeEventListener("pointermove", onDragPointerMove);
            window.removeEventListener("pointerup", onDragPointerUp);
            window.removeEventListener("pointercancel", onDragPointerUp);
        };
    }, [isDraggingBlock, onDragPointerMove, onDragPointerUp]);

    const onDragHandlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
        if (!activeBlockKey) return;

        event.preventDefault();
        event.stopPropagation();

        dragStateRef.current = {
            blockKey: activeBlockKey,
            lastClientY: event.clientY,
            active: true,
            dropTargetKey: activeBlockKey,
            dropPosition: "before",
        };
        setIsDraggingBlock(true);
        resolveDropTargetFromPointer(event.clientY);
        document.body.style.userSelect = "none";
    };

    if (!activeBlockKey) {
        return null;
    }

    return (
        <>
            <div className="demo-editor-block-actions" style={{top: `${blockTop}px`}}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button type="button" size="icon-xs" variant="ghost" className="demo-editor-block-action-button">
                            <Plus size={12}/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="right" className="min-w-52">
                        <div className="demo-editor-block-actions-title">Filter blocks...</div>
                        <DropdownMenuItem onClick={() => insertBlockAfter("paragraph")}><Text size={14}/>Paragraph</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => insertBlockAfter("h1")}><Heading size={14}/>Heading 1</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => insertBlockAfter("h2")}><Heading size={14}/>Heading 2</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => insertBlockAfter("h3")}><Heading size={14}/>Heading 3</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => insertBlockAfter("quote")}><Quote size={14}/>Quote</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}><ListOrdered
                            size={14}/>Numbered List</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}><ListChecks
                            size={14}/>Bullet List</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label="Drag to reorder block"
                    className={cn("demo-editor-block-action-button", isDraggingBlock ? "cursor-grabbing" : "cursor-grab")}
                    onPointerDown={onDragHandlePointerDown}
                >
                    <GripVertical size={12}/>
                </Button>
            </div>
            {isDraggingBlock && dragGuideTop !== null && (
                <div className="demo-editor-drag-guide" style={{top: `${dragGuideTop}px`}}/>
            )}
        </>
    );
};

const DemoEditor = () => {
    const {t} = useTranslation();
    const [value, setValue] = useState("");
    const shellRef = useRef<HTMLDivElement>(null);

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
                        <TabIndentListPlugin/>
                        <LinkPlugin/>
                        <OnChangePlugin onChange={onChange}/>
                    </div>
                </LexicalComposer>
            </Card>

            <Card className="p-4">
                <h2 className="mb-3 font-semibold">{t("editor.jsonOutput")}</h2>
                <ScrollArea className="h-120">
                    <pre className="bg-muted overflow-auto rounded-md p-3 text-xs">{value || "{ }"}</pre>
                </ScrollArea>
            </Card>
        </div>
    );
};

export default DemoEditor;
