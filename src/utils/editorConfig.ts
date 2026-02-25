import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import type { Klass, LexicalNode } from "lexical";

const theme = {
    paragraph: "editor-paragraph",
    quote: "editor-quote",
    heading: {
        h1: "editor-heading-h1",
        h2: "editor-heading-h2",
    },
    list: {
        ul: "editor-list-ul",
        ulDepth: ["editor-list-ul-depth-1", "editor-list-ul-depth-2", "editor-list-ul-depth-3"],
        ol: "editor-list-ol",
        olDepth: ["editor-list-ol-depth-1", "editor-list-ol-depth-2", "editor-list-ol-depth-3"],
        listitem: "editor-list-item",
        nested: {
            list: "editor-nested-list",
        },
    },
    text: {
        bold: "editor-text-bold",
        italic: "editor-text-italic",
        underline: "editor-text-underline",
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

export { editorConfig, nodes, theme };
