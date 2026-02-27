import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {$generateHtmlFromNodes, $generateNodesFromDOM} from "@lexical/html";
import {AutoLinkNode, LinkNode} from "@lexical/link";
import {ListItemNode, ListNode} from "@lexical/list";
import {AutoFocusPlugin} from "@lexical/react/LexicalAutoFocusPlugin";
import {LexicalComposer} from "@lexical/react/LexicalComposer";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {ContentEditable} from "@lexical/react/LexicalContentEditable";
import {LexicalErrorBoundary} from "@lexical/react/LexicalErrorBoundary";
import {HistoryPlugin} from "@lexical/react/LexicalHistoryPlugin";
import {LinkPlugin} from "@lexical/react/LexicalLinkPlugin";
import {ListPlugin} from "@lexical/react/LexicalListPlugin";
import {RichTextPlugin} from "@lexical/react/LexicalRichTextPlugin";
import {HeadingNode, QuoteNode} from "@lexical/rich-text";
import type {Klass, LexicalEditor, LexicalNode, SerializedEditorState, SerializedLexicalNode} from "lexical";
import {$createParagraphNode, $getRoot} from "lexical";
import {Copy, Download} from "lucide-react";
import {useTranslation} from "react-i18next";
import BlockSideActions from "@/components/editor/BlockSideActions.tsx";
import ListTabIndentationPlugin from "@/components/editor/ListTabIndentationPlugin.tsx";
import ToolbarPlugin from "@/components/editor/ToolbarPlugin.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Card, CardContent, CardHeader} from "@/components/ui/card.tsx";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
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

const escapeMarkdown = (value: string) => value.replace(/([\\`*_[\]{}()#+\-.!>])/g, "\\$1");

const getTextFormatBits = (format?: number | string) => (typeof format === "number" ? format : 0);

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

const getRootNode = (state: SerializedEditorStateNode | null): SerializedEditorNode | null => {
    if (!state) return null;
    if (state.root) return state.root as SerializedEditorNode;
    return null;
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

const escapeAttribute = (value: string) => value.replace(/"/g, "&quot;");

const formatHtmlNode = (node: ChildNode, depth: number): string[] => {
    const indent = "  ".repeat(depth);

    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim() ?? "";
        return text ? [`${indent}${text}`] : [];
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return [];

    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();
    const attributes = Array.from(element.attributes)
        .map((attr) => `${attr.name}="${escapeAttribute(attr.value)}"`)
        .join(" ");
    const openTag = attributes ? `<${tag} ${attributes}>` : `<${tag}>`;
    const children = Array.from(element.childNodes);

    if (children.length === 1 && children[0]?.nodeType === Node.TEXT_NODE) {
        const inlineText = children[0].textContent?.trim() ?? "";
        return inlineText ? [`${indent}${openTag}${inlineText}</${tag}>`] : [`${indent}${openTag}</${tag}>`];
    }

    const childLines = children.flatMap((child) => formatHtmlNode(child, depth + 1));

    if (childLines.length === 0) {
        return [`${indent}${openTag}</${tag}>`];
    }

    return [
        `${indent}${openTag}`,
        ...childLines,
        `${indent}</${tag}>`,
    ];
};

const formatHtmlForTextarea = (html: string) => {
    const dom = new DOMParser().parseFromString(html || "", "text/html");
    return Array.from(dom.body.childNodes)
        .flatMap((node) => formatHtmlNode(node, 0))
        .join("\n")
        .trim();
};

const removeWhitespaceTextNodes = (node: Node) => {
    Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE && !(child.textContent ?? "").trim()) {
            node.removeChild(child);
            return;
        }
        removeWhitespaceTextNodes(child);
    });
};

const LexicalSyncPlugin = ({
    onSync,
    onEditorReady,
}: {
    onSync: (editorState: SerializedEditorStateNode, html: string) => void;
    onEditorReady: (editor: LexicalEditor | null) => void;
}) => {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        onEditorReady(editor);

        const syncState = (editorState: ReturnType<LexicalEditor["getEditorState"]>) => {
            editorState.read(() => {
                onSync(editorState.toJSON() as SerializedEditorStateNode, $generateHtmlFromNodes(editor, null));
            });
        };

        syncState(editor.getEditorState());
        const unregister = editor.registerUpdateListener(({editorState}) => syncState(editorState));

        return () => {
            unregister();
            onEditorReady(null);
        };
    }, [editor, onEditorReady, onSync]);

    return null;
};

const DemoEditorPage = () => {
    const {t} = useTranslation();
    const [editorJson, setEditorJson] = useState<SerializedEditorStateNode | null>(null);
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("json");
    const [editorMode, setEditorMode] = useState<"editor" | "preview" | "html">("editor");
    const [htmlInput, setHtmlInput] = useState("");
    const [exportStatus, setExportStatus] = useState("");
    const shellRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<LexicalEditor | null>(null);
    const isApplyingHtmlRef = useRef(false);

    const handleLexicalSync = useCallback((nextEditorJson: SerializedEditorStateNode, nextHtml: string) => {
        setEditorJson(nextEditorJson);
        const formattedHtml = formatHtmlForTextarea(nextHtml);
        setHtmlInput((prev) => (prev === formattedHtml ? prev : formattedHtml));
        if (isApplyingHtmlRef.current) {
            isApplyingHtmlRef.current = false;
        }
    }, []);
    const handleEditorReady = useCallback((editor: LexicalEditor | null) => {
        editorRef.current = editor;
    }, []);

    const exportedTexts = useMemo(() => ({
        json: editorJson ? JSON.stringify(editorJson, null, 2) : "",
        html: htmlInput,
        markdown: convertLexicalJsonToMarkdown(editorJson),
    }), [editorJson, htmlInput]);

    const handleHtmlInputChange = useCallback((value: string) => {
        setHtmlInput(value);
        const editor = editorRef.current;
        if (!editor) return;

        const parser = new DOMParser();
        const dom = parser.parseFromString(value || "", "text/html");
        removeWhitespaceTextNodes(dom.body);
        isApplyingHtmlRef.current = true;
        editor.update(() => {
            const root = $getRoot();
            root.clear();
            const nodesFromHtml = $generateNodesFromDOM(editor, dom);
            if (nodesFromHtml.length === 0) {
                root.append($createParagraphNode());
                root.selectEnd();
                return;
            }
            root.append(...nodesFromHtml);
            root.selectEnd();
        });
    }, []);

    const handleHtmlReset = useCallback(() => {
        handleHtmlInputChange("");
    }, [handleHtmlInputChange]);

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
                        <LexicalSyncPlugin
                            onSync={handleLexicalSync}
                            onEditorReady={handleEditorReady}
                        />
                        <Tabs value={editorMode} onValueChange={(value) => setEditorMode(value as "editor" | "preview" | "html")} className="space-y-0">
                            <div className="border-b border-border/70 px-3 py-2">
                                <TabsList className="grid h-8 w-fit grid-cols-3">
                                    <TabsTrigger value="editor">{t("editor.modeEditor")}</TabsTrigger>
                                    <TabsTrigger value="preview">{t("editor.modePreview")}</TabsTrigger>
                                    <TabsTrigger value="html">{t("editor.modeHtml")}</TabsTrigger>
                                </TabsList>
                            </div>

                            {/* Editor */}
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
                                </div>
                            </TabsContent>

                            {/* Preview */}
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

                            {/* HTML */}
                            <TabsContent value="html" forceMount className={editorMode !== "html" ? "hidden" : "mt-0"}>
                                <div className="space-y-2 p-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-xs text-muted-foreground">{t("editor.htmlInputDescription")}</p>
                                        <Button size="sm" variant="ghost" onClick={handleHtmlReset}>
                                            {t("editor.htmlReset")}
                                        </Button>
                                    </div>
                                    <Textarea
                                        value={htmlInput}
                                        onChange={(event) => handleHtmlInputChange(event.target.value)}
                                        placeholder={t("editor.htmlInputPlaceholder")}
                                        aria-label={t("editor.htmlInputAria")}
                                        className="h-[380px] resize-none font-mono text-xs leading-relaxed"
                                    />
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
