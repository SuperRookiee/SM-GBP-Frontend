import type {Dispatch, SetStateAction} from "react";
import {Highlighter, List, ListOrdered} from "lucide-react";
import {toolbarButtonClass} from "@/types/editor/toolbar.type.ts";
import ColorPicker from "@/components/editor/plugins/toolbar/color-picker/ColorPicker.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";

interface IListColorControlsProps {
    textColor: string;
    highlightColor: string;
    isTextColorOpen: boolean;
    isHighlightOpen: boolean;
    isTextColorDragging: boolean;
    isHighlightDragging: boolean;
    setIsTextColorOpen: Dispatch<SetStateAction<boolean>>;
    setIsHighlightOpen: Dispatch<SetStateAction<boolean>>;
    setIsTextColorDragging: Dispatch<SetStateAction<boolean>>;
    setIsHighlightDragging: Dispatch<SetStateAction<boolean>>;
    applyTextStyle: (styles: Record<string, string>) => void;
    clearTextColor: () => void;
    clearHighlight: () => void;
    insertUnorderedList: () => void;
    insertOrderedList: () => void;
    clearList: () => void;
}

const ListColorControls = ({
    textColor,
    highlightColor,
    isTextColorOpen,
    isHighlightOpen,
    isTextColorDragging,
    isHighlightDragging,
    setIsTextColorOpen,
    setIsHighlightOpen,
    setIsTextColorDragging,
    setIsHighlightDragging,
    applyTextStyle,
    clearTextColor,
    clearHighlight,
    insertUnorderedList,
    insertOrderedList,
    clearList,
}: IListColorControlsProps) => {
    return (
        <div className="demo-editor-toolbar-group">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon-sm" className={toolbarButtonClass}><List size={15}/></Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-1">
                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={insertUnorderedList}><List size={15}/>Bullet List</Button>
                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={insertOrderedList}><ListOrdered size={15}/>Numbered List</Button>
                    <div className="my-1 border-t"/>
                    <Button variant="ghost" className="w-full justify-start" onClick={clearList}>Clear List</Button>
                </PopoverContent>
            </Popover>

            <Popover
                open={isTextColorOpen}
                onOpenChange={(open) => {
                    setIsTextColorOpen(open);
                    if (!open) setIsTextColorDragging(false);
                }}
            >
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon-sm" className={toolbarButtonClass} onMouseDown={(event) => event.preventDefault()}><span className="demo-editor-color-icon" style={{color: textColor}}>A</span></Button>
                </PopoverTrigger>
                <PopoverContent
                    align="start"
                    className="demo-editor-color-popover"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                    onInteractOutside={(event) => {
                        if (isTextColorDragging) event.preventDefault();
                    }}
                >
                    <ColorPicker
                        key={textColor}
                        value={textColor}
                        onChange={(color) => applyTextStyle({color})}
                        clearLabel="Clear"
                        onClear={clearTextColor}
                        onDragStateChange={setIsTextColorDragging}
                    />
                </PopoverContent>
            </Popover>

            <Popover
                open={isHighlightOpen}
                onOpenChange={(open) => {
                    setIsHighlightOpen(open);
                    if (!open) setIsHighlightDragging(false);
                }}
            >
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon-sm" className={toolbarButtonClass} onMouseDown={(event) => event.preventDefault()}>
                        <Highlighter size={14} style={{color: highlightColor === "transparent" ? "currentColor" : highlightColor}}/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    align="start"
                    className="demo-editor-color-popover"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                    onInteractOutside={(event) => {
                        if (isHighlightDragging) event.preventDefault();
                    }}
                >
                    <ColorPicker
                        key={highlightColor}
                        value={highlightColor}
                        onChange={(color) => applyTextStyle({"background-color": color})}
                        allowTransparent
                        clearLabel="Clear"
                        onClear={clearHighlight}
                        onDragStateChange={setIsHighlightDragging}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default ListColorControls;
