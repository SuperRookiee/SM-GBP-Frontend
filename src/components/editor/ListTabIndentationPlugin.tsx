import {useEffect} from "react";
import {$isListItemNode} from "@lexical/list";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {$findMatchingParent} from "@lexical/utils";
import {$getSelection, $isRangeSelection, COMMAND_PRIORITY_EDITOR, INDENT_CONTENT_COMMAND, KEY_TAB_COMMAND, OUTDENT_CONTENT_COMMAND} from "lexical";

const ListTabIndentationPlugin = () => {
    const [editor] = useLexicalComposerContext();

    // #. Tab 키를 들여쓰기 동작으로 연결
    useEffect(() => {
        // 모든 블록에서 Tab/Shift+Tab을 들여쓰기/내어쓰기로 매핑
        return editor.registerCommand(
            KEY_TAB_COMMAND,
            (event: KeyboardEvent) => {
                const selection = $getSelection();

                if (!$isRangeSelection(selection)) {
                    return false;
                }

                const anchorNode = selection.anchor.getNode();
                const listItemNode = $findMatchingParent(anchorNode, $isListItemNode);

                event.preventDefault();

                if (event.shiftKey) {
                    editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
                    return true;
                }

                if (listItemNode) {
                    const previousSibling = listItemNode.getPreviousSibling();

                    // 일반 에디터 동작과 맞추기 위해 같은 레벨의 첫 항목은 추가 들여쓰기를 막는다.
                    if (!$isListItemNode(previousSibling)) {
                        return true;
                    }
                }

                editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
                return true;
            },
            COMMAND_PRIORITY_EDITOR,
        );
    }, [editor]);

    return null;
};

export default ListTabIndentationPlugin;
