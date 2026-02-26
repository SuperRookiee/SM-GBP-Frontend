import type {ElementFormatType} from "lexical";
import {AlignLeft, ChevronDown, Indent} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";

interface IAlignmentControlsProps {
    alignLabel: string;
    applyAlign: (align: ElementFormatType) => void;
    outdent: () => void;
    indent: () => void;
}

const AlignmentControls = ({alignLabel, applyAlign, outdent, indent}: IAlignmentControlsProps) => {
    return (
        <div className="demo-editor-toolbar-group">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="demo-editor-toolbar-trigger min-w-34 justify-between"><span className="inline-flex items-center gap-2"><AlignLeft size={15}/>{alignLabel}</span><ChevronDown size={15}/></Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="min-w-52 p-1">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => applyAlign("left")}>Left Align</Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => applyAlign("center")}>Center Align</Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => applyAlign("right")}>Right Align</Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => applyAlign("justify")}>Justify Align</Button>
                    <div className="my-1 border-t"/>
                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={outdent}><Indent size={15} className="rotate-180"/>Outdent</Button>
                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={indent}><Indent size={15}/>Indent</Button>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default AlignmentControls;
