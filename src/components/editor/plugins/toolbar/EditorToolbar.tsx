import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND} from "@lexical/list";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {$createHeadingNode, $isHeadingNode, QuoteNode} from "@lexical/rich-text";
import {$getSelectionStyleValueForProperty, $patchStyleText, $setBlocksType} from "@lexical/selection";
import {mergeRegister} from "@lexical/utils";
import type {ElementFormatType} from "lexical";
import {$createParagraphNode, $createRangeSelection, $getNodeByKey, $getSelection, $isRangeSelection, $setSelection, CAN_REDO_COMMAND, CAN_UNDO_COMMAND, COMMAND_PRIORITY_LOW, FORMAT_ELEMENT_COMMAND, FORMAT_TEXT_COMMAND, INDENT_CONTENT_COMMAND, OUTDENT_CONTENT_COMMAND, REDO_COMMAND, SELECTION_CHANGE_COMMAND, UNDO_COMMAND} from "lexical";
import type {BlockType, SavedRangeSelection, TextFormat} from "@/types/editor/toolbar.type.ts";
import AlignmentControls from "@/components/editor/plugins/toolbar/groups/AlignmentControls.tsx";
import BlockFontControls from "@/components/editor/plugins/toolbar/groups/BlockFontControls.tsx";
import HistoryControls from "@/components/editor/plugins/toolbar/groups/HistoryControls.tsx";
import ListColorControls from "@/components/editor/plugins/toolbar/groups/ListColorControls.tsx";
import TextFormatControls from "@/components/editor/plugins/toolbar/groups/TextFormatControls.tsx";

const EditorToolbar = () => {
    const [editor] = useLexicalComposerContext();
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [blockType, setBlockType] = useState<BlockType>("paragraph");
    const [fontFamily, setFontFamily] = useState("Arial");
    const [fontSize, setFontSize] = useState(15);
    const [fontSizeInput, setFontSizeInput] = useState("15");
    const [textColor, setTextColor] = useState("#000000");
    const [highlightColor, setHighlightColor] = useState("transparent");
    const [isTextColorOpen, setIsTextColorOpen] = useState(false);
    const [isHighlightOpen, setIsHighlightOpen] = useState(false);
    const [isTextColorDragging, setIsTextColorDragging] = useState(false);
    const [isHighlightDragging, setIsHighlightDragging] = useState(false);
    const [alignType, setAlignType] = useState<ElementFormatType>("left");
    const savedRangeSelectionRef = useRef<SavedRangeSelection | null>(null);
    const [formats, setFormats] = useState<Record<TextFormat, boolean>>({
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        code: false,
    });

    // #. 현재 블록 타입 상태를 표시용 라벨로 변환한다.
    const blockLabel = useMemo(() => {
        if (blockType === "h1") return "Heading 1";
        if (blockType === "h2") return "Heading 2";
        if (blockType === "h3") return "Heading 3";
        if (blockType === "quote") return "Quote";
        return "Normal";
    }, [blockType]);

    // #. 현재 정렬 타입 상태를 표시용 라벨로 변환한다.
    const alignLabel = useMemo(() => {
        if (alignType === "center") return "Center Align";
        if (alignType === "right") return "Right Align";
        if (alignType === "justify") return "Justify Align";
        return "Left Align";
    }, [alignType]);

    // #. 선택 영역의 포맷/정렬/스타일 상태를 읽어 툴바 UI 상태를 동기화한다.
    const updateToolbar = useCallback(() => {
        editor.getEditorState().read(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return;

            const topLevelNode = selection.anchor.getNode().getTopLevelElementOrThrow();
            const headingType = $isHeadingNode(topLevelNode) ? topLevelNode.getTag() : undefined;
            setBlockType(
                headingType === "h1" || headingType === "h2" || headingType === "h3"
                    ? headingType
                    : topLevelNode.getType() === "quote"
                        ? "quote"
                        : "paragraph",
            );

            const nextAlign = (typeof (topLevelNode as { getFormatType?: () => string }).getFormatType === "function")
                ? (topLevelNode as { getFormatType: () => string }).getFormatType()
                : "left";
            setAlignType(nextAlign === "center" || nextAlign === "right" || nextAlign === "justify" ? nextAlign : "left");
            setFormats({
                bold: selection.hasFormat("bold"),
                italic: selection.hasFormat("italic"),
                underline: selection.hasFormat("underline"),
                strikethrough: selection.hasFormat("strikethrough"),
                code: selection.hasFormat("code"),
            });
            savedRangeSelectionRef.current = {
                anchor: {key: selection.anchor.key, offset: selection.anchor.offset, type: selection.anchor.type},
                focus: {key: selection.focus.key, offset: selection.focus.offset, type: selection.focus.type},
            };

            setFontFamily($getSelectionStyleValueForProperty(selection, "font-family", "Arial").replaceAll("\"", ""));
            const resolvedSize = Number.parseInt($getSelectionStyleValueForProperty(selection, "font-size", "15px"), 10);
            const nextFontSize = Number.isNaN(resolvedSize) ? 15 : resolvedSize;
            setFontSize(nextFontSize);
            setFontSizeInput(String(nextFontSize));
            setTextColor($getSelectionStyleValueForProperty(selection, "color", "#000000"));
            setHighlightColor($getSelectionStyleValueForProperty(selection, "background-color", "transparent"));
        });
    }, [editor]);

    // #. 현재 선택 영역이 없을 때 저장된 RangeSelection을 복원해 동일 범위에 스타일을 적용한다.
    const withCurrentOrSavedRangeSelection = (callback: (selection: ReturnType<typeof $createRangeSelection>) => void) => {
        editor.update(() => {
            const activeSelection = $getSelection();
            if ($isRangeSelection(activeSelection)) {
                callback(activeSelection);
                return;
            }

            const saved = savedRangeSelectionRef.current;
            if (!saved) return;
            if (!$getNodeByKey(saved.anchor.key) || !$getNodeByKey(saved.focus.key)) return;

            const rangeSelection = $createRangeSelection();
            rangeSelection.anchor.set(saved.anchor.key, saved.anchor.offset, saved.anchor.type);
            rangeSelection.focus.set(saved.focus.key, saved.focus.offset, saved.focus.type);
            $setSelection(rangeSelection);
            callback(rangeSelection);
        });
    };

    // #. 문단/제목/인용 블록 타입을 적용한다.
    const applyHeading = (type: BlockType) => {
        editor.update(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return;
            if (type === "paragraph") return $setBlocksType(selection, () => $createParagraphNode());
            if (type === "h1" || type === "h2" || type === "h3") return $setBlocksType(selection, () => $createHeadingNode(type));
            $setBlocksType(selection, () => new QuoteNode());
        });
    };

    // #. 인라인 스타일(색상/배경색/폰트/크기 등)을 선택 영역에 적용한다.
    const applyTextStyle = (styles: Record<string, string>) => {
        withCurrentOrSavedRangeSelection((selection) => {
            $patchStyleText(selection, styles);
        });
    };

    // #. 블록 정렬 상태를 변경한다.
    const applyAlign = (nextAlign: ElementFormatType) => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, nextAlign);
        setAlignType(nextAlign);
    };

    // #. 글자 크기 입력값을 보정 후 적용한다.
    const applyFontSize = (nextSize: number) => {
        const clampedSize = Math.min(72, Math.max(10, nextSize));
        setFontSize(clampedSize);
        setFontSizeInput(String(clampedSize));
        applyTextStyle({"font-size": `${clampedSize}px`});
    };

    // #. 글자 크기 input 값을 파싱해 실제 스타일로 확정 적용한다.
    const commitFontSizeInput = () => {
        const parsed = Number.parseInt(fontSizeInput, 10);
        if (Number.isNaN(parsed)) return setFontSizeInput(String(fontSize));
        applyFontSize(parsed);
    };

    // #. 텍스트 색상을 초기 상태(inherit)로 되돌린다.
    const clearTextColor = () => {
        applyTextStyle({color: "inherit"});
        setTextColor("inherit");
    };

    // #. 하이라이트 배경색을 제거한다.
    const clearHighlight = () => {
        applyTextStyle({"background-color": "transparent"});
        setHighlightColor("transparent");
    };

    // #. 텍스트 포맷 명령을 에디터에 전달한다.
    const formatText = (format: TextFormat) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    };

    // #. 에디터 업데이트/선택 변경/undo-redo 가능 상태를 구독한다.
    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(() => updateToolbar()),
            editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
                updateToolbar();
                return false;
            }, COMMAND_PRIORITY_LOW),
            editor.registerCommand(CAN_UNDO_COMMAND, (payload) => {
                setCanUndo(payload);
                return false;
            }, COMMAND_PRIORITY_LOW),
            editor.registerCommand(CAN_REDO_COMMAND, (payload) => {
                setCanRedo(payload);
                return false;
            }, COMMAND_PRIORITY_LOW),
        );
    }, [editor, updateToolbar]);

    return (
        <section className="demo-editor-toolbar">
            {/* 실행 취소/다시 실행 */}
            <HistoryControls
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
                onRedo={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
            />

            {/* 블록 타입, 폰트, 글자 크기 */}
            <BlockFontControls
                blockLabel={blockLabel}
                fontFamily={fontFamily}
                fontSize={fontSize}
                fontSizeInput={fontSizeInput}
                setFontSizeInput={setFontSizeInput}
                applyHeading={applyHeading}
                applyTextStyle={applyTextStyle}
                applyFontSize={applyFontSize}
                commitFontSizeInput={commitFontSizeInput}
            />

            {/* 정렬/들여쓰기 */}
            <AlignmentControls
                alignLabel={alignLabel}
                applyAlign={applyAlign}
                outdent={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)}
                indent={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)}
            />

            {/* 인라인 텍스트 포맷 */}
            <TextFormatControls formats={formats} formatText={formatText}/>

            {/* 리스트, 텍스트 색상, 하이라이트 색상 */}
            <ListColorControls
                textColor={textColor}
                highlightColor={highlightColor}
                isTextColorOpen={isTextColorOpen}
                isHighlightOpen={isHighlightOpen}
                isTextColorDragging={isTextColorDragging}
                isHighlightDragging={isHighlightDragging}
                setIsTextColorOpen={setIsTextColorOpen}
                setIsHighlightOpen={setIsHighlightOpen}
                setIsTextColorDragging={setIsTextColorDragging}
                setIsHighlightDragging={setIsHighlightDragging}
                applyTextStyle={applyTextStyle}
                clearTextColor={clearTextColor}
                clearHighlight={clearHighlight}
                insertUnorderedList={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
                insertOrderedList={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
                clearList={() => editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)}
            />
        </section>
    );
};

export default EditorToolbar;
