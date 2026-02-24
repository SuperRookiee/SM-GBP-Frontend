import { useEffect } from "react";
import { $isListItemNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent } from "@lexical/utils";
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_EDITOR, INDENT_CONTENT_COMMAND, KEY_TAB_COMMAND, OUTDENT_CONTENT_COMMAND } from "lexical";

const ListTabIndentationPlugin = () => {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerCommand(
            KEY_TAB_COMMAND,
            (event: KeyboardEvent) => {
                const selection = $getSelection();

                if (!$isRangeSelection(selection)) {
                    return false;
                }

                const anchorNode = selection.anchor.getNode();
                const listItemNode = $findMatchingParent(anchorNode, $isListItemNode);

                if (!listItemNode) {
                    return false;
                }

                event.preventDefault();

                if (!event.shiftKey) {
                    const previousSibling = listItemNode.getPreviousSibling();

                    // Match common editor behavior: first item in a list level cannot indent.
                    if (!$isListItemNode(previousSibling)) {
                        return true;
                    }
                }

                if (event.shiftKey) {
                    editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
                    return true;
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
