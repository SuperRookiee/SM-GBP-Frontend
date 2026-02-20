import { useState } from "react";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import type { EditorState, LexicalEditor } from "lexical";
import { editorConfig } from "@/components/editor/demo/demoEditorConfig";
import DemoEditorToolbar from "@/components/editor/demo/DemoEditorToolbar";
import { Card } from "@/components/ui/card";

import "@/styles/demoEditor.css";

const DemoEditor = () => {
    const [value, setValue] = useState("");

    const onChange = (editorState: EditorState, editor: LexicalEditor) => {
        editorState.read(() => {
            setValue(JSON.stringify(editor.toJSON(), null, 2));
        });
    };

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden">
                <LexicalComposer initialConfig={editorConfig}>
                    <DemoEditorToolbar/>
                    <div className="editor-shell">
                        <RichTextPlugin
                            contentEditable={<ContentEditable className="editor-input"/>}
                            placeholder={<div className="editor-placeholder">내용을 입력해보세요...</div>}
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                        <HistoryPlugin/>
                        <AutoFocusPlugin/>
                        <ListPlugin hasStrictIndent/>
                        <TabIndentationPlugin maxIndent={7}/>
                        <LinkPlugin/>
                        <OnChangePlugin onChange={onChange}/>
                    </div>
                </LexicalComposer>
            </Card>

            <Card className="p-4">
                <h2 className="font-semibold mb-3">Lexical JSON Output</h2>
                <pre className="bg-muted rounded-md p-3 text-xs h-[360px] overflow-auto">{value || "{ }"}</pre>
            </Card>
        </div>
    );
};

export default DemoEditor;
