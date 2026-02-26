import {Bold, Code, Italic, Strikethrough, Underline} from "lucide-react";
import {cn} from "@/utils/utils.ts";
import {toolbarButtonClass, type TextFormat} from "@/types/editor/toolbar.type.ts";
import {Button} from "@/components/ui/button.tsx";

interface ITextFormatControlsProps {
    formats: Record<TextFormat, boolean>;
    formatText: (format: TextFormat) => void;
}

const TextFormatControls = ({formats, formatText}: ITextFormatControlsProps) => {
    return (
        <div className="demo-editor-toolbar-group">
            <Button variant="ghost" size="icon-sm" className={cn(toolbarButtonClass, formats.bold && "is-active")} onClick={() => formatText("bold")}><Bold size={15}/></Button>
            <Button variant="ghost" size="icon-sm" className={cn(toolbarButtonClass, formats.italic && "is-active")} onClick={() => formatText("italic")}><Italic size={15}/></Button>
            <Button variant="ghost" size="icon-sm" className={cn(toolbarButtonClass, formats.underline && "is-active")} onClick={() => formatText("underline")}><Underline size={15}/></Button>
            <Button variant="ghost" size="icon-sm" className={cn(toolbarButtonClass, formats.strikethrough && "is-active")} onClick={() => formatText("strikethrough")}><Strikethrough size={15}/></Button>
            <Button variant="ghost" size="icon-sm" className={cn(toolbarButtonClass, formats.code && "is-active")} onClick={() => formatText("code")}><Code size={15}/></Button>
        </div>
    );
};

export default TextFormatControls;
