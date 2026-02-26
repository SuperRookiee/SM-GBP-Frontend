import type {PointerEvent as ReactPointerEvent, RefObject} from "react";
import {useCallback, useEffect, useRef, useState} from "react";
import {INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND} from "@lexical/list";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {$createHeadingNode, QuoteNode} from "@lexical/rich-text";
import {mergeRegister} from "@lexical/utils";
import {$createParagraphNode, $getNodeByKey, $getRoot, $getSelection, $isRangeSelection, COMMAND_PRIORITY_LOW, SELECTION_CHANGE_COMMAND} from "lexical";
import {GripVertical, Heading, List, ListOrdered, Plus, Quote, Text} from "lucide-react";
import {cn} from "@/utils/utils.ts";
import {Button} from "@/components/ui/button.tsx";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu.tsx";

type InsertBlockType = "paragraph" | "h1" | "h2" | "h3" | "quote";

interface IBlockSideActionsProps {
    shellRef: RefObject<HTMLDivElement | null>;
}

const BlockSideActions = ({shellRef}: IBlockSideActionsProps) => {
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

    const onDragPointerUp = useCallback((event: PointerEvent) => {
        const target = event.target as HTMLElement | null;
        if (target?.closest(".demo-editor-toolbar")) {
            return;
        }

        const {blockKey, dropTargetKey, dropPosition} = dragStateRef.current;
        if (blockKey && dropTargetKey) {
            moveBlockByDropTarget(blockKey, dropTargetKey, dropPosition);
        }
        stopDragging();
    }, [moveBlockByDropTarget, stopDragging]);

    const onDragPointerCancel = useCallback(() => {
        stopDragging();
    }, [stopDragging]);

    useEffect(() => {
        if (!isDraggingBlock) return;

        window.addEventListener("pointermove", onDragPointerMove);
        window.addEventListener("pointerup", onDragPointerUp);
        window.addEventListener("pointercancel", onDragPointerCancel);

        return () => {
            window.removeEventListener("pointermove", onDragPointerMove);
            window.removeEventListener("pointerup", onDragPointerUp);
            window.removeEventListener("pointercancel", onDragPointerCancel);
        };
    }, [isDraggingBlock, onDragPointerMove, onDragPointerUp, onDragPointerCancel]);

    const onDragHandlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
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
            <div className="demo-editor-block-actions" style={{top: `${blockTop - 3}px`}}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button type="button" size="icon-xs" variant="ghost" className="demo-editor-block-action-button">
                            <Plus size={10}/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="right" className="min-w-52">
                        <div className="demo-editor-block-actions-title">Filter blocks...</div>
                        <DropdownMenuItem onClick={() => insertBlockAfter("paragraph")}><Text size={10}/>Paragraph</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => insertBlockAfter("h1")}><Heading size={10}/>Heading 1</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => insertBlockAfter("h2")}><Heading size={10}/>Heading 2</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => insertBlockAfter("h3")}><Heading size={10}/>Heading 3</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => insertBlockAfter("quote")}><Quote size={10}/>Quote</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}><ListOrdered size={10}/>Numbered List</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}><List size={10}/>Bullet List</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label="Drag to reorder block"
                    className={cn("demo-editor-block-action-button -ml-1", isDraggingBlock ? "cursor-grabbing" : "cursor-grab")}
                    onPointerDown={onDragHandlePointerDown}
                >
                    <GripVertical size={10}/>
                </Button>
            </div>
            {isDraggingBlock && dragGuideTop !== null && (
                <div className="demo-editor-drag-guide" style={{top: `${dragGuideTop}px`}}/>
            )}
        </>
    );
};

export default BlockSideActions;
