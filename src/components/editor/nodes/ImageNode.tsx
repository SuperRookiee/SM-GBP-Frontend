import type {JSX} from "react";
import type {DOMConversionMap, DOMConversionOutput, DOMExportOutput, LexicalEditor, NodeKey, SerializedLexicalNode, Spread} from "lexical";
import {$applyNodeReplacement, createCommand, DecoratorNode} from "lexical";

export type ImagePayload = {
    altText?: string;
    src: string;
};

export type SerializedImageNode = Spread<
    {
        altText: string;
        src: string;
        type: "image";
        version: 1;
    },
    SerializedLexicalNode
>;

export const INSERT_IMAGE_COMMAND = createCommand<ImagePayload>("INSERT_IMAGE_COMMAND");

const convertImageElement = (domNode: Node): DOMConversionOutput | null => {
    // #. HTML의 img 태그를 Lexical 이미지 노드로 변환
    if (!(domNode instanceof HTMLImageElement)) return null;
    return {
        node: $createImageNode({
            src: domNode.getAttribute("src") ?? "",
            altText: domNode.getAttribute("alt") ?? "",
        }),
    };
};

export class ImageNode extends DecoratorNode<JSX.Element> {
    __src: string;
    __altText: string;

    static getType() {
        return "image";
    }

    static clone(node: ImageNode) {
        return new ImageNode(node.__src, node.__altText, node.__key);
    }

    static importJSON(serializedNode: SerializedImageNode) {
        return $createImageNode({
            src: serializedNode.src,
            altText: serializedNode.altText,
        });
    }

    exportJSON(): SerializedImageNode {
        return {
            altText: this.getAltText(),
            src: this.getSrc(),
            type: "image",
            version: 1,
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
        return {element};
    }

    constructor(src: string, altText = "", key?: NodeKey) {
        super(key);
        this.__src = src;
        this.__altText = altText;
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
        return <img src={this.__src} alt={this.__altText} className="editor-image"/>;
    }

    getSrc() {
        return this.__src;
    }

    getAltText() {
        return this.__altText;
    }
}

export const $createImageNode = ({src, altText = ""}: ImagePayload) => $applyNodeReplacement(new ImageNode(src, altText));
