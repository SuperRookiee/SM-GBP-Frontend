import EditorToolbar from "@/components/editor/plugins/toolbar/EditorToolbar.tsx";
import SelectionFloatingToolbar from "@/components/editor/plugins/toolbar/SelectionFloatingToolbar.tsx";

const ToolbarPlugin = () => {
    return (
        <>
            <EditorToolbar/>
            <SelectionFloatingToolbar/>
        </>
    );
};

export default ToolbarPlugin;
