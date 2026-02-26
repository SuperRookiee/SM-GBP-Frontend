import {useCallback, useEffect, useState} from "react";
import {INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND} from "@lexical/list";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {$createHeadingNode, $isHeadingNode} from "@lexical/rich-text";
import {$setBlocksType} from "@lexical/selection";
import {mergeRegister} from "@lexical/utils";
import {$createParagraphNode, $getSelection, $isRangeSelection, COMMAND_PRIORITY_LOW, FORMAT_TEXT_COMMAND, SELECTION_CHANGE_COMMAND,} from "lexical";
import LexicalToolbarButton from "@/components/editor/legacy/LexicalToolbarButton.tsx";

interface ToolbarFormats {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    heading: boolean;
}

const EditorToolbar = () => {
    const [editor] = useLexicalComposerContext();
    const [formats, setFormats] = useState<ToolbarFormats>({
        bold: false,
        italic: false,
        underline: false,
        heading: false,
    });

    // #. 현재 선택 영역의 포맷 상태를 읽어 툴바 버튼 활성 상태를 동기화한다.
    const updateToolbar = useCallback(() => {
        editor.getEditorState().read(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) {
                return;
            }

            const anchorNode = selection.anchor.getNode();
            const topLevelNode = anchorNode.getTopLevelElementOrThrow();

            setFormats({
                bold: selection.hasFormat("bold"),
                italic: selection.hasFormat("italic"),
                underline: selection.hasFormat("underline"),
                heading: $isHeadingNode(topLevelNode),
            });
        });
    }, [editor]);

// #. 제목/본문 형식을 토글한다.
    const toggleHeading = () => {
        editor.update(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) {
                return;
            }

            const anchorNode = selection.anchor.getNode();
            const topLevelNode = anchorNode.getTopLevelElementOrThrow();

            if ($isHeadingNode(topLevelNode)) {
                $setBlocksType(selection, () => $createParagraphNode());
                return;
            }

            $setBlocksType(selection, () => $createHeadingNode("h1"));
        });
    };

    // #. 에디터 업데이트/선택 변경 이벤트를 구독해 툴바 상태를 갱신한다.
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
            {/* 블록 타입 */}
            <LexicalToolbarButton label="H1" isActive={formats.heading} onClick={toggleHeading}/>
            {/* 인라인 텍스트 포맷 */}
            <LexicalToolbarButton label="B" isActive={formats.bold} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}/>
            <LexicalToolbarButton label="I" isActive={formats.italic} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}/>
            <LexicalToolbarButton label="U" isActive={formats.underline} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}/>
            {/* 리스트 컨트롤 */}
            <LexicalToolbarButton label="• List" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}/>
            <LexicalToolbarButton label="1. List" onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}/>
            <LexicalToolbarButton label="Clear List" onClick={() => editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)}/>
        </div>
    );
};

export default EditorToolbar;

