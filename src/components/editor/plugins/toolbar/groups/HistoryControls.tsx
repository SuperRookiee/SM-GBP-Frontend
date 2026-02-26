import {Redo2, Undo2} from "lucide-react";
import {toolbarButtonClass} from "@/types/editor/toolbar.type.ts";
import {Button} from "@/components/ui/button.tsx";

interface IHistoryControlsProps {
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
}

const HistoryControls = ({canUndo, canRedo, onUndo, onRedo}: IHistoryControlsProps) => {
    return (
        <div className="demo-editor-toolbar-group">
            <Button variant="ghost" size="icon-sm" className={toolbarButtonClass} disabled={!canUndo} onClick={onUndo}><Undo2 size={16}/></Button>
            <Button variant="ghost" size="icon-sm" className={toolbarButtonClass} disabled={!canRedo} onClick={onRedo}><Redo2 size={16}/></Button>
        </div>
    );
};

export default HistoryControls;
