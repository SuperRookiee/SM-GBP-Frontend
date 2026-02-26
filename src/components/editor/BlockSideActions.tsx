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
    // #. 블록 드래그 상태를 React 렌더와 분리해 포인터 이동 중 성능 저하를 줄인다.
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

    // #. 선택된 블록 기준으로 사이드 액션 위치를 동기화
    const syncBlockPosition = useCallback(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
            setActiveBlockKey(null);
            return;
        }

        // 현재 커서가 위치한 최상위 블록의 화면 좌표를 기준으로 액션 버튼 위치를 맞춘다.
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

    // #. 현재 블록 뒤에 선택한 타입의 블록을 삽입
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

    // #. 드롭 타깃과 위치(before/after)에 따라 블록 순서를 재배치
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

    // #. 포인터 Y 좌표를 기반으로 드롭 대상 블록과 가이드 위치를 계산
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

        // 포인터가 각 블록의 중간선보다 위에 있으면 해당 블록 앞(before)으로 삽입
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

    // #. 드래그 상태와 가이드를 초기화하고 선택 방지 상태를 해제
    const stopDragging = useCallback(() => {
        if (!dragStateRef.current.active) return;

        dragStateRef.current = {blockKey: null, lastClientY: 0, active: false, dropTargetKey: null, dropPosition: "before"};
        setIsDraggingBlock(false);
        setDragGuideTop(null);
        document.body.style.userSelect = "";
    }, []);

    // #. 드래그 중 포인터 이동에 맞춰 드롭 타깃을 갱신
    const onDragPointerMove = useCallback((event: PointerEvent) => {
        const dragState = dragStateRef.current;
        if (!dragState.active || !dragState.blockKey) return;

        dragState.lastClientY = event.clientY;
        resolveDropTargetFromPointer(event.clientY);
    }, [resolveDropTargetFromPointer]);

    // #. 포인터 업 시 실제 블록 이동을 적용하고 드래그를 종료
    const onDragPointerUp = useCallback((event: PointerEvent) => {
        const target = event.target as HTMLElement | null;
        // 툴바 클릭은 블록 이동 드롭으로 처리하지 않는다.
        if (target?.closest(".demo-editor-toolbar")) {
            return;
        }

        const {blockKey, dropTargetKey, dropPosition} = dragStateRef.current;
        if (blockKey && dropTargetKey) {
            moveBlockByDropTarget(blockKey, dropTargetKey, dropPosition);
        }
        stopDragging();
    }, [moveBlockByDropTarget, stopDragging]);

    // #. 드래그 취소 이벤트를 처리
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

    // #. 드래그 핸들 포인터 다운 시 드래그 상태를 시작
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
            {/* 블록 추가/이동 액션 래퍼 */}
            <div className="demo-editor-block-actions" style={{top: `${blockTop - 3}px`}}>
                {/* 블록 추가 메뉴 */}
                <DropdownMenu>
                    {/* 블록 추가 메뉴 트리거 */}
                    <DropdownMenuTrigger asChild>
                        <Button type="button" size="icon-xs" variant="ghost" className="demo-editor-block-action-button">
                            <Plus size={10}/>
                        </Button>
                    </DropdownMenuTrigger>
                    {/* 블록 타입 선택 메뉴 */}
                    <DropdownMenuContent align="start" side="right" className="min-w-52">
                        {/* 메뉴 타이틀 */}
                        <div className="demo-editor-block-actions-title">Filter blocks...</div>
                        {/* 단락 삽입 */}
                        <DropdownMenuItem onClick={() => insertBlockAfter("paragraph")}><Text size={10}/>Paragraph</DropdownMenuItem>
                        {/* H1 삽입 */}
                        <DropdownMenuItem onClick={() => insertBlockAfter("h1")}><Heading size={10}/>Heading 1</DropdownMenuItem>
                        {/* H2 삽입 */}
                        <DropdownMenuItem onClick={() => insertBlockAfter("h2")}><Heading size={10}/>Heading 2</DropdownMenuItem>
                        {/* H3 삽입 */}
                        <DropdownMenuItem onClick={() => insertBlockAfter("h3")}><Heading size={10}/>Heading 3</DropdownMenuItem>
                        {/* 인용구 삽입 */}
                        <DropdownMenuItem onClick={() => insertBlockAfter("quote")}><Quote size={10}/>Quote</DropdownMenuItem>
                        {/* 번호 목록 삽입 */}
                        <DropdownMenuItem onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}><ListOrdered size={10}/>Numbered List</DropdownMenuItem>
                        {/* 불릿 목록 삽입 */}
                        <DropdownMenuItem onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}><List size={10}/>Bullet List</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* 블록 순서 이동용 드래그 핸들 */}
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
            {/* 드래그 중 표시되는 삽입 가이드 라인 */}
            {isDraggingBlock && dragGuideTop !== null && (
                <div className="demo-editor-drag-guide" style={{top: `${dragGuideTop}px`}}/>
            )}
        </>
    );
};

export default BlockSideActions;
