import {useMemo, useRef, useState} from "react";
import {AutoLinkNode, LinkNode} from "@lexical/link";
import {ListItemNode, ListNode} from "@lexical/list";
import {AutoFocusPlugin} from "@lexical/react/LexicalAutoFocusPlugin";
import {LexicalComposer} from "@lexical/react/LexicalComposer";
import {ContentEditable} from "@lexical/react/LexicalContentEditable";
import {LexicalErrorBoundary} from "@lexical/react/LexicalErrorBoundary";
import {HistoryPlugin} from "@lexical/react/LexicalHistoryPlugin";
import {LinkPlugin} from "@lexical/react/LexicalLinkPlugin";
import {ListPlugin} from "@lexical/react/LexicalListPlugin";
import {OnChangePlugin} from "@lexical/react/LexicalOnChangePlugin";
import {RichTextPlugin} from "@lexical/react/LexicalRichTextPlugin";
import {HeadingNode, QuoteNode} from "@lexical/rich-text";
import type {EditorState, Klass, LexicalNode, SerializedEditorState, SerializedLexicalNode} from "lexical";
import {Copy, Download} from "lucide-react";
import {useTranslation} from "react-i18next";
import BlockSideActions from "@/components/editor/BlockSideActions.tsx";
import ListTabIndentationPlugin from "@/components/editor/ListTabIndentationPlugin.tsx";
import ToolbarPlugin from "@/components/editor/ToolbarPlugin.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Card, CardContent, CardHeader} from "@/components/ui/card.tsx";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import "@/styles/demoEditor.module.css";

const theme = {
    paragraph: "editor-paragraph",
    quote: "editor-quote",
    heading: {
        h1: "editor-heading-h1",
        h2: "editor-heading-h2",
        h3: "editor-heading-h3",
    },
    list: {
        ul: "editor-list-ul",
        ol: "editor-list-ol",
        listitem: "editor-list-item",
    },
    text: {
        bold: "editor-text-bold",
        italic: "editor-text-italic",
        underline: "editor-text-underline",
        strikethrough: "editor-text-strikethrough",
        subscript: "editor-text-subscript",
        superscript: "editor-text-superscript",
        code: "editor-text-code",
    },
};

const nodes: Array<Klass<LexicalNode>> = [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode];

const editorConfig = {
    namespace: "DemoEditor",
    theme,
    nodes,
    onError: (error: Error) => {
        throw error;
    },
};

type ExportFormat = "html" | "markdown" | "json";

type SerializedEditorNode = SerializedLexicalNode & {
    type?: string;
    text?: string;
    tag?: string;
    url?: string;
    format?: number | string;
    listType?: "bullet" | "number" | string;
    children?: SerializedEditorNode[];
};

type SerializedEditorStateNode = SerializedEditorState<SerializedLexicalNode>;

const TEXT_FORMAT = {
    bold: 1,
    italic: 1 << 1,
    strikethrough: 1 << 2,
    underline: 1 << 3,
    code: 1 << 4,
    subscript: 1 << 5,
    superscript: 1 << 6,
} as const;

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const escapeMarkdown = (value: string) => value.replace(/([\\`*_[\]{}()#+\-.!>])/g, "\\$1");

const getTextFormatBits = (format?: number | string) => (typeof format === "number" ? format : 0);

const applyHtmlTextFormat = (text: string, format?: number | string) => {
    const bits = getTextFormatBits(format);
    let output = text;
    if (bits & TEXT_FORMAT.code) output = `<code>${output}</code>`;
    if (bits & TEXT_FORMAT.bold) output = `<strong>${output}</strong>`;
    if (bits & TEXT_FORMAT.italic) output = `<em>${output}</em>`;
    if (bits & TEXT_FORMAT.underline) output = `<u>${output}</u>`;
    if (bits & TEXT_FORMAT.strikethrough) output = `<s>${output}</s>`;
    if (bits & TEXT_FORMAT.subscript) output = `<sub>${output}</sub>`;
    if (bits & TEXT_FORMAT.superscript) output = `<sup>${output}</sup>`;
    return output;
};

const applyMarkdownTextFormat = (text: string, format?: number | string) => {
    const bits = getTextFormatBits(format);
    let output = text;
    if (bits & TEXT_FORMAT.code) output = `\`${output}\``;
    if (bits & TEXT_FORMAT.bold) output = `**${output}**`;
    if (bits & TEXT_FORMAT.italic) output = `*${output}*`;
    if (bits & TEXT_FORMAT.strikethrough) output = `~~${output}~~`;
    if (bits & TEXT_FORMAT.underline) output = `<u>${output}</u>`;
    if (bits & TEXT_FORMAT.subscript) output = `<sub>${output}</sub>`;
    if (bits & TEXT_FORMAT.superscript) output = `<sup>${output}</sup>`;
    return output;
};

const getNodeChildren = (node: SerializedEditorNode) => (Array.isArray(node.children) ? node.children : []);

const renderInlineHtml = (nodes: SerializedEditorNode[]): string =>
    nodes
        .map((node) => {
            switch (node.type) {
                case "text":
                    return applyHtmlTextFormat(escapeHtml(node.text ?? ""), node.format);
                case "linebreak":
                    return "<br />";
                case "link":
                    return `<a href="${escapeHtml(node.url ?? "#")}">${renderInlineHtml(getNodeChildren(node))}</a>`;
                default:
                    return renderInlineHtml(getNodeChildren(node));
            }
        })
        .join("");

const getListDepthClass = (type: "ul" | "ol", depth: number) => {
    const normalizedDepth = Math.min(Math.max(depth + 1, 1), 3);
    return `editor-list-${type}-depth-${normalizedDepth}`;
};

const renderBlockHtml = (node: SerializedEditorNode, listDepth = 0): string => {
    const children = getNodeChildren(node);
    switch (node.type) {
        case "paragraph":
            return `<p class="editor-paragraph">${renderInlineHtml(children)}</p>`;
        case "heading": {
            const tag = node.tag && /^h[1-6]$/.test(node.tag) ? node.tag : "h2";
            return `<${tag} class="editor-heading-${tag}">${renderInlineHtml(children)}</${tag}>`;
        }
        case "quote":
            return `<blockquote class="editor-quote">${renderInlineHtml(children)}</blockquote>`;
        case "list": {
            const listTag = node.listType === "number" ? "ol" : "ul";
            const listClass = `editor-list-${listTag}`;
            const depthClass = getListDepthClass(listTag, listDepth);
            const nestedClass = listDepth > 0 ? " editor-nested-list" : "";
            const items = children.map((item) => renderBlockHtml(item, listDepth + 1)).join("");
            return `<${listTag} class="${listClass} ${depthClass}${nestedClass}">${items}</${listTag}>`;
        }
        case "listitem":
            return `<li class="editor-list-item">${children.map((child) => renderBlockHtml(child, listDepth)).join("") || renderInlineHtml(children)}</li>`;
        case "linebreak":
            return "<br />";
        default:
            return renderInlineHtml(children);
    }
};

const getRootNode = (state: SerializedEditorStateNode | null): SerializedEditorNode | null => {
    if (!state) return null;
    if (state.root) return state.root as SerializedEditorNode;
    return null;
};

const convertLexicalJsonToHtml = (state: SerializedEditorStateNode | null) => {
    const rootNode = getRootNode(state);
    if (!rootNode) return "";
    return getNodeChildren(rootNode).map((node) => renderBlockHtml(node)).join("\n");
};

const renderInlineMarkdown = (nodes: SerializedEditorNode[]): string =>
    nodes
        .map((node) => {
            switch (node.type) {
                case "text":
                    return applyMarkdownTextFormat(escapeMarkdown(node.text ?? ""), node.format);
                case "linebreak":
                    return "  \n";
                case "link": {
                    const label = renderInlineMarkdown(getNodeChildren(node)) || node.url || "";
                    return `[${label}](${node.url ?? "#"})`;
                }
                default:
                    return renderInlineMarkdown(getNodeChildren(node));
            }
        })
        .join("");

const renderListMarkdown = (node: SerializedEditorNode, depth = 0): string => {
    const children = getNodeChildren(node);
    return children
        .map((item, index) => {
            if (item.type !== "listitem") return "";
            const itemChildren = getNodeChildren(item);
            const nestedLists = itemChildren.filter((child) => child.type === "list");
            const contentNodes = itemChildren.filter((child) => child.type !== "list");
            const marker = node.listType === "number" ? `${index + 1}.` : "-";
            const content = (renderInlineMarkdown(contentNodes).trim() || " ").replace(/\n+/g, " ");
            const prefix = `${"  ".repeat(depth)}${marker} ${content}`;
            const nested = nestedLists.map((listNode) => renderListMarkdown(listNode, depth + 1)).join("");
            return `${prefix}\n${nested}`;
        })
        .join("");
};

const renderBlockMarkdown = (node: SerializedEditorNode): string => {
    const children = getNodeChildren(node);
    switch (node.type) {
        case "paragraph": {
            const content = renderInlineMarkdown(children).trim();
            return content ? `${content}\n\n` : "\n";
        }
        case "heading": {
            const level = node.tag?.match(/^h([1-6])$/)?.[1] ?? "2";
            return `${"#".repeat(Number(level))} ${renderInlineMarkdown(children).trim()}\n\n`;
        }
        case "quote": {
            const lines = renderInlineMarkdown(children)
                .split("\n")
                .map((line) => `> ${line}`)
                .join("\n");
            return `${lines}\n\n`;
        }
        case "list":
            return `${renderListMarkdown(node)}\n`;
        default:
            return renderInlineMarkdown(children);
    }
};

const convertLexicalJsonToMarkdown = (state: SerializedEditorStateNode | null) => {
    const rootNode = getRootNode(state);
    if (!rootNode) return "";
    return getNodeChildren(rootNode)
        .map((node) => renderBlockMarkdown(node))
        .join("")
        .trim();
};

const downloadTextFile = (content: string, extension: string, mimeType: string) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const blob = new Blob([content], {type: `${mimeType};charset=utf-8`});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `demo-editor-${timestamp}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
};

const DemoEditorPage = () => {
    const {t} = useTranslation();
    const [editorJson, setEditorJson] = useState<SerializedEditorStateNode | null>(null);
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("json");
    const [editorMode, setEditorMode] = useState<"editor" | "preview">("editor");
    const [exportStatus, setExportStatus] = useState("");
    const shellRef = useRef<HTMLDivElement>(null);

    const onChange = (editorState: EditorState) => {
        editorState.read(() => setEditorJson(editorState.toJSON()));
    };

    const exportedTexts = useMemo(() => ({
        json: editorJson ? JSON.stringify(editorJson, null, 2) : "",
        html: convertLexicalJsonToHtml(editorJson),
        markdown: convertLexicalJsonToMarkdown(editorJson),
    }), [editorJson]);

    const handleCopy = async () => {
        const value = exportedTexts[selectedFormat];
        if (!value) return;

        if (!navigator?.clipboard?.writeText) {
            setExportStatus(t("editor.copyUnavailable"));
            return;
        }

        try {
            await navigator.clipboard.writeText(value);
            setExportStatus(t("editor.copySuccess", {format: selectedFormat.toUpperCase()}));
        } catch {
            setExportStatus(t("editor.copyFailed"));
        }
    };

    const handleDownload = () => {
        const value = exportedTexts[selectedFormat];
        if (!value) return;

        const fileMeta: Record<ExportFormat, { ext: string; mime: string }> = {
            json: {ext: "json", mime: "application/json"},
            html: {ext: "html", mime: "text/html"},
            markdown: {ext: "md", mime: "text/markdown"},
        };

        const {ext, mime} = fileMeta[selectedFormat];
        downloadTextFile(value, ext, mime);
        setExportStatus(t("editor.downloadSuccess", {format: selectedFormat.toUpperCase()}));
    };

    return (
        <div className="space-y-6 p-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t("editorPage.title")}</h1>
                <p className="mt-2 text-muted-foreground">{t("editorPage.description")}</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
                {/* 에디터 */}
                <Card className="overflow-hidden pt-0 lg:col-span-2">
                    <LexicalComposer initialConfig={editorConfig}>
                        <Tabs value={editorMode} onValueChange={(value) => setEditorMode(value as "editor" | "preview")} className="space-y-0">
                            <div className="border-b border-border/70 px-3 py-2">
                                <TabsList className="grid h-8 w-fit grid-cols-2">
                                    <TabsTrigger value="editor">{t("editor.modeEditor")}</TabsTrigger>
                                    <TabsTrigger value="preview">{t("editor.modePreview")}</TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="editor" forceMount className={editorMode !== "editor" ? "hidden" : "mt-0"}>
                                <ToolbarPlugin/>
                                <div className="editor-shell" ref={shellRef}>
                                    <BlockSideActions shellRef={shellRef}/>
                                    <RichTextPlugin
                                        contentEditable={<ContentEditable className="editor-input" aria-label={t("editor.inputAria")}/>}
                                        placeholder={<div className="editor-placeholder">{t("editor.placeholder")}</div>}
                                        ErrorBoundary={LexicalErrorBoundary}
                                    />
                                    <HistoryPlugin/>
                                    <AutoFocusPlugin/>
                                    <ListPlugin/>
                                    <ListTabIndentationPlugin/>
                                    <LinkPlugin/>
                                    <OnChangePlugin onChange={onChange}/>
                                </div>
                            </TabsContent>

                            <TabsContent value="preview" forceMount className={editorMode !== "preview" ? "hidden" : "mt-0"}>
                                <div className="editor-shell min-h-0">
                                    <ScrollArea className="h-[420px]">
                                        {exportedTexts.html ? (
                                            <div className="editor-input min-h-0 p-4" dangerouslySetInnerHTML={{__html: exportedTexts.html}}/>
                                        ) : (
                                            <p className="p-4 text-sm text-muted-foreground">{t("editor.renderedPreviewEmpty")}</p>
                                        )}
                                    </ScrollArea>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </LexicalComposer>
                </Card>

                {/* 내보내기 */}
                <Card className="border-border/70 bg-gradient-to-b from-card to-muted/20 lg:col-span-1">
                    <CardHeader className="border-b border-border/70 pb-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-base font-semibold tracking-tight">{t("editor.exportTitle")}</h2>
                                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t("editor.exportDescription")}</p>
                            </div>
                            <span className="rounded-full border border-border/80 bg-background px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                                {selectedFormat}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <section className="rounded-lg border border-border/80 bg-background/70 p-1">
                            <div className="grid grid-cols-3 gap-1">
                                <Button
                                    size="sm"
                                    className="h-8"
                                    variant={selectedFormat === "html" ? "default" : "ghost"}
                                    onClick={() => setSelectedFormat("html")}
                                >
                                {t("editor.formatHtml")}
                                </Button>
                                <Button
                                    size="sm"
                                    className="h-8"
                                    variant={selectedFormat === "markdown" ? "default" : "ghost"}
                                    onClick={() => setSelectedFormat("markdown")}
                                >
                                {t("editor.formatMarkdown")}
                                </Button>
                                <Button
                                    size="sm"
                                    className="h-8"
                                    variant={selectedFormat === "json" ? "default" : "ghost"}
                                    onClick={() => setSelectedFormat("json")}
                                >
                                {t("editor.formatJson")}
                                </Button>
                            </div>
                        </section>

                        <section className="flex items-center justify-between gap-3">
                            <p className="min-h-5 flex-1 text-xs text-muted-foreground">
                                {exportStatus || "\u00A0"}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="icon-sm"
                                    variant="secondary"
                                    onClick={handleCopy}
                                    aria-label={t("editor.copy")}
                                    title={t("editor.copy")}
                                >
                                    <Copy />
                                </Button>
                                <Button
                                    size="icon-sm"
                                    onClick={handleDownload}
                                    aria-label={t("editor.download")}
                                    title={t("editor.download")}
                                >
                                    <Download />
                                </Button>
                            </div>
                        </section>

                        <section className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold">{t("editor.exportPreview")}</h3>
                                <span className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                                    .{selectedFormat === "markdown" ? "md" : selectedFormat}
                                </span>
                            </div>
                            <div className="rounded-lg border border-border/80 bg-background/80 p-2">
                                <ScrollArea className="h-60">
                                    <pre className="overflow-auto whitespace-pre-wrap break-words rounded-md bg-muted/70 p-3 font-mono text-xs leading-relaxed">
                                        {exportedTexts[selectedFormat] || t("editor.exportEmpty")}
                                    </pre>
                                </ScrollArea>
                            </div>
                        </section>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DemoEditorPage;
