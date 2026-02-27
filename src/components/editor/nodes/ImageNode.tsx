import type {JSX} from "react";
import type {DOMConversionMap, DOMConversionOutput, DOMExportOutput, LexicalEditor, NodeKey, SerializedLexicalNode, Spread} from "lexical";
import {$applyNodeReplacement, createCommand, DecoratorNode} from "lexical";
import ImageComponent from "@/components/editor/ImageComponent.tsx";

export type ImagePayload = {
    altText?: string;
    src: string;
    width?: number | null;
};

export type SerializedImageNode = Spread<
    {
        altText: string;
        src: string;
        width: number | null;
        type: "image";
        version: 2;
    },
    SerializedLexicalNode
>;

export const INSERT_IMAGE_COMMAND = createCommand<ImagePayload>("INSERT_IMAGE_COMMAND");

const convertImageElement = (domNode: Node): DOMConversionOutput | null => {
    // #. HTML의 img 태그를 Lexical 이미지 노드로 변환
    if (!(domNode instanceof HTMLImageElement)) return null;
    const widthAttribute = domNode.getAttribute("width");
    const widthFromAttr = widthAttribute ? Number.parseInt(widthAttribute, 10) : Number.NaN;
    const styleWidth = domNode.style.width;
    const widthFromStyle = styleWidth.endsWith("px") ? Number.parseInt(styleWidth, 10) : Number.NaN;
    const resolvedWidth = Number.isFinite(widthFromAttr)
        ? widthFromAttr
        : Number.isFinite(widthFromStyle)
            ? widthFromStyle
            : null;
    return {
        node: $createImageNode({
            src: domNode.getAttribute("src") ?? "",
            altText: domNode.getAttribute("alt") ?? "",
            width: resolvedWidth,
        }),
    };
};

export class ImageNode extends DecoratorNode<JSX.Element> {
    __src: string;
    __altText: string;
    __width: number | null;

    static getType() {
        return "image";
    }

    static clone(node: ImageNode) {
        return new ImageNode(node.__src, node.__altText, node.__width, node.__key);
    }

    static importJSON(serializedNode: SerializedImageNode) {
        return $createImageNode({
            src: serializedNode.src,
            altText: serializedNode.altText,
            width: typeof serializedNode.width === "number" ? serializedNode.width : null,
        });
    }

    exportJSON(): SerializedImageNode {
        return {
            altText: this.getAltText(),
            src: this.getSrc(),
            width: this.getWidth(),
            type: "image",
            version: 2,
        };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            img: () => ({
                conversion: convertImageElement,
                priority: 1,
            }),
        };
    }

    exportDOM(): DOMExportOutput {
        // #. 내보낸 HTML 단독 실행 시에도 이미지 배치를 동일하게 유지
        const element = document.createElement("img");
        element.setAttribute("src", this.getSrc());
        const altText = this.getAltText();
        if (altText) element.setAttribute("alt", altText);
        element.setAttribute("class", "editor-image");
        element.style.display = "inline-block";
        element.style.maxWidth = "100%";
        element.style.height = "auto";
        element.style.verticalAlign = "middle";
        element.style.margin = "0 0.25rem";
        const width = this.getWidth();
        if (width) element.style.width = `${width}px`;
        return {element};
    }

    constructor(src: string, altText = "", width: number | null = null, key?: NodeKey) {
        super(key);
        this.__src = src;
        this.__altText = altText;
        this.__width = width;
    }

    createDOM(): HTMLElement {
        const wrapper = document.createElement("span");
        wrapper.className = "editor-image-wrapper";
        return wrapper;
    }

    updateDOM(): false {
        return false;
    }

    decorate(editor: LexicalEditor): JSX.Element {
        // #. DecoratorNode 시그니처 호환을 위한 인자
        void editor;
        return <ImageComponent src={this.__src} altText={this.__altText} nodeKey={this.__key} width={this.__width}/>;
    }

    getSrc() {
        return this.__src;
    }

    getAltText() {
        return this.__altText;
    }

    getWidth() {
        return this.getLatest().__width;
    }

    setWidth(width: number | null) {
        const writable = this.getWritable();
        writable.__width = width;
    }
}

export const $createImageNode = ({src, altText = "", width = null}: ImagePayload) => $applyNodeReplacement(new ImageNode(src, altText, width));

export const $isImageNode = (node: unknown): node is ImageNode => node instanceof ImageNode;
