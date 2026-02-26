import type {Dispatch, SetStateAction} from "react";
import {ChevronDown, Heading, Minus, Plus} from "lucide-react";
import {fontOptions, toolbarButtonClass, type BlockType} from "@/types/editor/toolbar.type.ts";
import {Button} from "@/components/ui/button.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";

interface IBlockFontControlsProps {
    blockLabel: string;
    fontFamily: string;
    fontSize: number;
    fontSizeInput: string;
    setFontSizeInput: Dispatch<SetStateAction<string>>;
    applyHeading: (type: BlockType) => void;
    applyTextStyle: (styles: Record<string, string>) => void;
    applyFontSize: (nextSize: number) => void;
    commitFontSizeInput: () => void;
}

const BlockFontControls = ({
    blockLabel,
    fontFamily,
    fontSize,
    fontSizeInput,
    setFontSizeInput,
    applyHeading,
    applyTextStyle,
    applyFontSize,
    commitFontSizeInput,
}: IBlockFontControlsProps) => {
    return (
        <div className="demo-editor-toolbar-group">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="demo-editor-toolbar-trigger min-w-40 justify-between"><span className="inline-flex items-center gap-2"><Heading size={15}/>{blockLabel}</span><ChevronDown size={15}/></Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="min-w-56 p-1">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => applyHeading("paragraph")}>Normal</Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => applyHeading("h1")}>Heading 1</Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => applyHeading("h2")}>Heading 2</Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => applyHeading("h3")}>Heading 3</Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => applyHeading("quote")}>Quote</Button>
                </PopoverContent>
            </Popover>

            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="demo-editor-toolbar-trigger min-w-32 justify-between"><span className="truncate">{fontFamily}</span><ChevronDown size={15}/></Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="min-w-56 p-1">
                    {fontOptions.map((font) => <Button key={font} variant="ghost" className="w-full justify-start" onClick={() => applyTextStyle({"font-family": font})} style={{fontFamily: font}}>{font}</Button>)}
                </PopoverContent>
            </Popover>

            <div className="demo-editor-font-size-control">
                <Button variant="ghost" size="icon-sm" className={toolbarButtonClass} onClick={() => applyFontSize(fontSize - 1)}><Minus size={15}/></Button>
                <input
                    type="number"
                    min={10}
                    max={72}
                    step={1}
                    inputMode="numeric"
                    className="demo-editor-font-size-input"
                    value={fontSizeInput}
                    onChange={(event) => setFontSizeInput(event.target.value)}
                    onBlur={commitFontSizeInput}
                    onKeyDown={(event) => {
                        if (event.key !== "Enter") return;
                        event.preventDefault();
                        commitFontSizeInput();
                        (event.currentTarget as HTMLInputElement).blur();
                    }}
                />
                <Button variant="ghost" size="icon-sm" className={toolbarButtonClass} onClick={() => applyFontSize(fontSize + 1)}><Plus size={15}/></Button>
            </div>
        </div>
    );
};

export default BlockFontControls;
