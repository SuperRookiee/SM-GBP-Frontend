import type {PointerEvent as ReactPointerEvent, RefObject} from "react";
import {useCallback, useEffect, useRef, useState} from "react";
import {$createListItemNode, $createListNode} from "@lexical/list";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {$createHeadingNode, QuoteNode} from "@lexical/rich-text";
import {mergeRegister} from "@lexical/utils";
import {$createParagraphNode, $getNodeByKey, $getRoot, $getSelection, $isRangeSelection, COMMAND_PRIORITY_LOW, SELECTION_CHANGE_COMMAND} from "lexical";
import {GripVertical, Heading, List, ListOrdered, Plus, Quote, Text, Trash2} from "lucide-react";
import {useTranslation} from "react-i18next";
import {cn} from "@/utils/utils.ts";
import {Button} from "@/components/ui/button.tsx";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu.tsx";

type InsertBlockType = "paragraph" | "h1" | "h2" | "h3" | "quote";
type InsertListType = "bullet" | "number";

interface IBlockSideActionsProps {
    shellRef: RefObject<HTMLDivElement | null>;
}

const BlockSideActions = ({shellRef}: IBlockSideActionsProps) => {
    const [editor] = useLexicalComposerContext();
    const {t} = useTranslation();
    const [activeBlockKey, setActiveBlockKey] = useState<string | null>(null);
    const [blockTop, setBlockTop] = useState(0);
    const [blockHeight, setBlockHeight] = useState(0);
    const [isDraggingBlock, setIsDraggingBlock] = useState(false);
    const [dragGuideTop, setDragGuideTop] = useState<number | null>(null);
    const [isInsertMenuOpen, setIsInsertMenuOpen] = useState(false);
    const [isBlockMenuOpen, setIsBlockMenuOpen] = useState(false);
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
    // #. Grip 버튼의 클릭/드래그를 구분하기 위한 포인터 추적 상태
    const dragPointerRef = useRef<{
        pointerId: number | null;
        startX: number;
        startY: number;
        moved: boolean;
        active: boolean;
    }>({
        pointerId: null,
        startX: 0,
        startY: 0,
        moved: false,
        active: false,
    });

    // #. 선택된 블록 기준으로 사이드 액션 위치를 동기화
    const syncBlockPosition = useCallback(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
            return;
        }

        // 현재 커서가 위치한 최상위 블록의 화면 좌표를 기준으로 액션 버튼 위치를 맞춘다.
        const topLevelNode = selection.anchor.getNode().getTopLevelElementOrThrow();
        const key = topLevelNode.getKey();
        const blockElement = editor.getElementByKey(key);

        if (!blockElement || !shellRef.current) {
            return;
        }

        const shellRect = shellRef.current.getBoundingClientRect();
        const blockRect = blockElement.getBoundingClientRect();

        setActiveBlockKey(key);
        setBlockTop(blockRect.top - shellRect.top);
        setBlockHeight(blockRect.height);
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

    useEffect(() => {
        if (!shellRef.current || isDraggingBlock) return;

        const shellElement = shellRef.current;

        const syncBlockFromHover = (clientY: number) => {
            const blockLayouts: Array<{ key: string; rect: DOMRect }> = [];

            editor.getEditorState().read(() => {
                const blocks = $getRoot().getChildren();
                blocks.forEach((block) => {
                    const blockElement = editor.getElementByKey(block.getKey());
                    if (!blockElement) return;
                    blockLayouts.push({key: block.getKey(), rect: blockElement.getBoundingClientRect()});
                });
            });

            if (blockLayouts.length === 0) {
                setActiveBlockKey(null);
                return;
            }

            const hovered = blockLayouts.find((block) => clientY >= block.rect.top && clientY <= block.rect.bottom)
                ?? blockLayouts.reduce((closest, block) => {
                    const closestCenterY = closest.rect.top + closest.rect.height / 2;
                    const blockCenterY = block.rect.top + block.rect.height / 2;
                    const closestDistance = Math.abs(clientY - closestCenterY);
                    const blockDistance = Math.abs(clientY - blockCenterY);
                    return blockDistance < closestDistance ? block : closest;
                }, blockLayouts[0]);

            const shellRect = shellElement.getBoundingClientRect();
            setActiveBlockKey(hovered.key);
            setBlockTop(hovered.rect.top - shellRect.top);
            setBlockHeight(hovered.rect.height);
        };

        const onMouseMove = (event: MouseEvent) => {
            syncBlockFromHover(event.clientY);
        };

        const onMouseLeave = () => {
            if (isInsertMenuOpen || isBlockMenuOpen) return;
            setActiveBlockKey(null);
        };

        shellElement.addEventListener("mousemove", onMouseMove);
        shellElement.addEventListener("mouseleave", onMouseLeave);

        return () => {
            shellElement.removeEventListener("mousemove", onMouseMove);
            shellElement.removeEventListener("mouseleave", onMouseLeave);
        };
    }, [editor, isBlockMenuOpen, isDraggingBlock, isInsertMenuOpen, shellRef]);

    // #. 현재 블록 뒤에 선택한 타입의 블록을 삽입
    const insertBlockAfter = (type: InsertBlockType) => {
        editor.update(() => {
            const currentBlock = activeBlockKey
                ? $getNodeByKey(activeBlockKey)?.getTopLevelElementOrThrow()
                : (() => {
                    const selection = $getSelection();
                    if (!$isRangeSelection(selection)) return null;
                    return selection.anchor.getNode().getTopLevelElementOrThrow();
                })();
            if (!currentBlock) return;

            const newNode = type === "paragraph"
                ? $createParagraphNode()
                : type === "quote"
                    ? new QuoteNode()
                    : $createHeadingNode(type);

            currentBlock.insertAfter(newNode);
            newNode.selectStart();
            setActiveBlockKey(newNode.getKey());
        });
    };

    // #. 현재 블록 뒤에 리스트 블록을 삽입하고 첫 아이템으로 커서를 이동
    const insertListAfter = (type: InsertListType) => {
        editor.update(() => {
            const currentBlock = activeBlockKey
                ? $getNodeByKey(activeBlockKey)?.getTopLevelElementOrThrow()
                : (() => {
                    const selection = $getSelection();
                    if (!$isRangeSelection(selection)) return null;
                    return selection.anchor.getNode().getTopLevelElementOrThrow();
                })();
            if (!currentBlock) return;

            const listNode = $createListNode(type);
            const listItemNode = $createListItemNode();
            listItemNode.append($createParagraphNode());
            listNode.append(listItemNode);
            currentBlock.insertAfter(listNode);
            listItemNode.selectStart();
            setActiveBlockKey(listNode.getKey());
        });
    };

    // #. 드롭다운 액션 후 에디터 포커스를 복원해 새 블록 커서 위치를 유지
    const refocusEditor = () => {
        requestAnimationFrame(() => {
            editor.focus();
        });
    };

    // #. 메뉴 선택 시 삽입 로직과 포커스 복원을 동일한 타이밍으로 처리
    const handleInsertSelect = (event: Event, action: () => void) => {
        event.preventDefault();
        action();
        setIsInsertMenuOpen(false);
        refocusEditor();
    };
    // #. 현재 활성 블록을 삭제하고, 인접 블록(또는 새 문단)으로 커서를 이동
    const deleteActiveBlock = useCallback(() => {
        editor.update(() => {
            const currentBlock = activeBlockKey
                ? $getNodeByKey(activeBlockKey)?.getTopLevelElementOrThrow()
                : (() => {
                    const selection = $getSelection();
                    if (!$isRangeSelection(selection)) return null;
                    return selection.anchor.getNode().getTopLevelElementOrThrow();
                })();
            if (!currentBlock) return;

            const nextBlock = currentBlock.getNextSibling();
            const prevBlock = currentBlock.getPreviousSibling();
            currentBlock.remove();

            const targetBlock = nextBlock ?? prevBlock;
            if (targetBlock) {
                targetBlock.selectStart();
                setActiveBlockKey(targetBlock.getKey());
                return;
            }

            const paragraph = $createParagraphNode();
            $getRoot().append(paragraph);
            paragraph.selectStart();
            setActiveBlockKey(paragraph.getKey());
        });
    }, [activeBlockKey, editor]);

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

    // #. 드래그 시작을 실제 이동 시점까지 지연해 클릭/드래그를 분리
    const startDraggingFromPoint = useCallback((clientY: number) => {
        if (!activeBlockKey) return;

        dragStateRef.current = {
            blockKey: activeBlockKey,
            lastClientY: clientY,
            active: true,
            dropTargetKey: activeBlockKey,
            dropPosition: "before",
        };
        setIsDraggingBlock(true);
        setIsBlockMenuOpen(false);
        resolveDropTargetFromPointer(clientY);
        document.body.style.userSelect = "none";
    }, [activeBlockKey, resolveDropTargetFromPointer]);
    // #. Grip 포인터 다운 시 클릭/드래그 판별용 초기 좌표를 기록
    const onDragHandlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
        if (!activeBlockKey || isInsertMenuOpen) return;

        event.preventDefault();
        event.stopPropagation();
        dragPointerRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            moved: false,
            active: true,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
    };
    // #. 임계값 이상 이동하면 드래그 모드로 전환
    const onDragHandlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
        const pointer = dragPointerRef.current;
        if (!pointer.active || pointer.pointerId !== event.pointerId) return;
        if (isDraggingBlock) return;

        const deltaX = Math.abs(event.clientX - pointer.startX);
        const deltaY = Math.abs(event.clientY - pointer.startY);
        if (deltaX + deltaY < 4) return;

        pointer.moved = true;
        startDraggingFromPoint(event.clientY);
    };
    // #. 이동이 없으면 클릭으로 간주해 블록 메뉴를 연다.
    const onDragHandlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
        const pointer = dragPointerRef.current;
        if (!pointer.active || pointer.pointerId !== event.pointerId) return;

        // #. 드래그가 진행 중이면 현재 포인터 업 이벤트로 즉시 드롭을 확정
        if (isDraggingBlock) {
            onDragPointerUp(event.nativeEvent);
        } else {
            event.preventDefault();
            event.stopPropagation();
            if (!pointer.moved) {
                setIsBlockMenuOpen(true);
            }
        }
        dragPointerRef.current = {
            pointerId: null,
            startX: 0,
            startY: 0,
            moved: false,
            active: false,
        };
    };
    // #. 포인터 취소 시 클릭/드래그 대기 상태를 정리
    const onDragHandlePointerCancel = (event: ReactPointerEvent<HTMLButtonElement>) => {
        const pointer = dragPointerRef.current;
        if (pointer.pointerId === event.pointerId) {
            dragPointerRef.current = {
                pointerId: null,
                startX: 0,
                startY: 0,
                moved: false,
                active: false,
            };
        }
    };

    if (!activeBlockKey && !isDraggingBlock && !isInsertMenuOpen) {
        return null;
    }

    return (
        <>
            {(activeBlockKey || isDraggingBlock || isInsertMenuOpen) && (
                /* 블록 추가/이동 액션 래퍼 */
                <div
                    className={cn("demo-editor-block-actions", isDraggingBlock && "is-dragging")}
                    style={{transform: `translate3d(0, ${blockTop + blockHeight / 2}px, 0) translateY(-50%)`}}
                >
                    {/* 블록 추가 메뉴 */}
                    <DropdownMenu open={isInsertMenuOpen} onOpenChange={setIsInsertMenuOpen}>
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
                            <DropdownMenuItem onSelect={(event) => handleInsertSelect(event, () => insertBlockAfter("paragraph"))}><Text size={10}/>Paragraph</DropdownMenuItem>
                            {/* H1 삽입 */}
                            <DropdownMenuItem onSelect={(event) => handleInsertSelect(event, () => insertBlockAfter("h1"))}><Heading size={10}/>Heading 1</DropdownMenuItem>
                            {/* H2 삽입 */}
                            <DropdownMenuItem onSelect={(event) => handleInsertSelect(event, () => insertBlockAfter("h2"))}><Heading size={10}/>Heading 2</DropdownMenuItem>
                            {/* H3 삽입 */}
                            <DropdownMenuItem onSelect={(event) => handleInsertSelect(event, () => insertBlockAfter("h3"))}><Heading size={10}/>Heading 3</DropdownMenuItem>
                            {/* 인용구 삽입 */}
                            <DropdownMenuItem onSelect={(event) => handleInsertSelect(event, () => insertBlockAfter("quote"))}><Quote size={10}/>Quote</DropdownMenuItem>
                            {/* 번호 목록 삽입 */}
                            <DropdownMenuItem onSelect={(event) => handleInsertSelect(event, () => insertListAfter("number"))}><ListOrdered size={10}/>Numbered List</DropdownMenuItem>
                            {/* 불릿 목록 삽입 */}
                            <DropdownMenuItem onSelect={(event) => handleInsertSelect(event, () => insertListAfter("bullet"))}><List size={10}/>Bullet List</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* 블록 순서 이동용 드래그 핸들 */}
                    <DropdownMenu open={isBlockMenuOpen} onOpenChange={setIsBlockMenuOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                size="icon-xs"
                                variant="ghost"
                                aria-label="Drag to reorder block"
                                className={cn("demo-editor-block-action-button -ml-1", isDraggingBlock ? "cursor-grabbing" : "cursor-grab")}
                                onPointerDown={onDragHandlePointerDown}
                                onPointerMove={onDragHandlePointerMove}
                                onPointerUp={onDragHandlePointerUp}
                                onPointerCancel={onDragHandlePointerCancel}
                            >
                                <GripVertical size={10}/>
                            </Button>
                        </DropdownMenuTrigger>
                        {/* 블록 단위 액션 메뉴 */}
                        <DropdownMenuContent align="start" side="right" className="min-w-40">
                            {/* 현재 줄 삭제 */}
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={(event) => {
                                    event.preventDefault();
                                    deleteActiveBlock();
                                    setIsBlockMenuOpen(false);
                                    refocusEditor();
                                }}
                            >
                                <Trash2 size={10}/>{t("editor.blockDelete")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
            {/* 드래그 중 표시되는 삽입 가이드 라인 */}
            {isDraggingBlock && dragGuideTop !== null && (
                <div className="demo-editor-drag-guide" style={{transform: `translate3d(0, ${dragGuideTop}px, 0)`}}/>
            )}
        </>
    );
};

export default BlockSideActions;
