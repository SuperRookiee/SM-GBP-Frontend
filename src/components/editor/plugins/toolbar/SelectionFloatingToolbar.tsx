import {useCallback, useEffect, useRef, useState} from "react";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {mergeRegister} from "@lexical/utils";
import {$getSelection, $isRangeSelection, COMMAND_PRIORITY_LOW, FORMAT_TEXT_COMMAND, SELECTION_CHANGE_COMMAND} from "lexical";
import {Bold, Italic, Strikethrough, Underline} from "lucide-react";
import {cn} from "@/utils/utils.ts";
import type {TextFormat} from "@/types/editor/toolbar.type.ts";
import {Button} from "@/components/ui/button.tsx";

const SelectionFloatingToolbar = () => {
    const [editor] = useLexicalComposerContext();
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
    const [formats, setFormats] = useState<Record<TextFormat, boolean>>({
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        code: false,
    });

    const syncSelectionToolbar = useCallback(() => {
        editor.getEditorState().read(() => {
            const selection = $getSelection();
            const rootElement = editor.getRootElement();
            if (!$isRangeSelection(selection) || selection.isCollapsed() || !rootElement) {
                setPosition(null);
                return;
            }

            const nativeSelection = window.getSelection();
            if (!nativeSelection || nativeSelection.rangeCount === 0) {
                setPosition(null);
                return;
            }

            const range = nativeSelection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) {
                setPosition(null);
                return;
            }

            setFormats({
                bold: selection.hasFormat("bold"),
                italic: selection.hasFormat("italic"),
                underline: selection.hasFormat("underline"),
                strikethrough: selection.hasFormat("strikethrough"),
                code: selection.hasFormat("code"),
            });

            const viewportMargin = 8;
            const toolbarWidth = toolbarRef.current?.offsetWidth ?? 420;
            const toolbarHeight = toolbarRef.current?.offsetHeight ?? 44;
            const desiredLeft = rect.left + rect.width / 2;
            const clampedLeft = Math.max(
                viewportMargin + toolbarWidth / 2,
                Math.min(window.innerWidth - viewportMargin - toolbarWidth / 2, desiredLeft),
            );
            const placeAboveTop = rect.top - toolbarHeight - 8;
            const top = placeAboveTop < viewportMargin ? rect.bottom + 8 : placeAboveTop;

            setPosition({top, left: clampedLeft});
        });
    }, [editor]);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(() => syncSelectionToolbar()),
            editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
                syncSelectionToolbar();
                return false;
            }, COMMAND_PRIORITY_LOW),
        );
    }, [editor, syncSelectionToolbar]);

    if (!position) return null;

    return (
        <div ref={toolbarRef} className="demo-editor-selection-toolbar" style={{top: position.top, left: position.left}}>
            <Button variant="ghost" size="icon-sm" className={cn("demo-editor-selection-button", formats.bold && "is-active")} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}><Bold size={14}/></Button>
            <Button variant="ghost" size="icon-sm" className={cn("demo-editor-selection-button", formats.italic && "is-active")} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}><Italic size={14}/></Button>
            <Button variant="ghost" size="icon-sm" className={cn("demo-editor-selection-button", formats.underline && "is-active")} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}><Underline size={14}/></Button>
            <Button variant="ghost" size="icon-sm" className={cn("demo-editor-selection-button", formats.strikethrough && "is-active")} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}><Strikethrough size={14}/></Button>
            <Button variant="ghost" size="icon-sm" className={cn("demo-editor-selection-button", formats.code && "is-active")} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}>{"<>"}</Button>
        </div>
    );
};

export default SelectionFloatingToolbar;
