import {type MouseEvent as ReactMouseEvent, useCallback, useEffect, useRef, useState} from "react";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {useLexicalNodeSelection} from "@lexical/react/useLexicalNodeSelection";
import {$getNodeByKey} from "lexical";
import {cn} from "@/utils/utils.ts";
import {$isImageNode} from "@/components/editor/nodes/ImageNode.tsx";

interface IImageComponentProps {
    src: string;
    altText: string;
    nodeKey: string;
    width: number | null;
}

export default function ImageComponent({src, altText, nodeKey, width}: IImageComponentProps) {
    const [editor] = useLexicalComposerContext();
    const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
    const frameRef = useRef<HTMLSpanElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [isResizing, setIsResizing] = useState(false);
    const [isActive, setIsActive] = useState(false);

    const updateNodeWidth = useCallback((nextWidth: number | null) => {
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if (!$isImageNode(node)) return;
            node.setWidth(nextWidth);
        });
    }, [editor, nodeKey]);

    const startResize = (event: ReactMouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const currentWidth = imageRef.current?.getBoundingClientRect().width ?? width ?? 220;
        const startX = event.clientX;
        setIsResizing(true);
        const onMove = (moveEvent: MouseEvent) => {
            moveEvent.preventDefault();
            const deltaX = moveEvent.clientX - startX;
            const nextWidth = Math.round(Math.min(1200, Math.max(80, currentWidth + deltaX)));
            updateNodeWidth(nextWidth);
        };
        const onUp = () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
            setIsResizing(false);
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    };

    useEffect(() => {
        // #. 이미지 바깥 클릭 시 리사이즈 UI를 닫음
        const onWindowMouseDown = (event: MouseEvent) => {
            const target = event.target as Node | null;
            if (!target) return;
            if (frameRef.current?.contains(target)) return;
            setIsActive(false);
        };
        window.addEventListener("mousedown", onWindowMouseDown);
        return () => {
            window.removeEventListener("mousedown", onWindowMouseDown);
        };
    }, []);

    return (
        <span
            ref={frameRef}
            className={cn("editor-image-frame", (isActive || isSelected || isResizing) && "is-selected")}
            onMouseDown={(event) => {
                if (event.shiftKey) setSelected(!isSelected);
                else {
                    clearSelection();
                    setSelected(true);
                }
                setIsActive(true);
            }}
        >
            <img
                ref={imageRef}
                src={src}
                alt={altText}
                className="editor-image"
                style={width ? {width: `${width}px`} : undefined}
                draggable={false}
            />
            <button
                type="button"
                className="editor-image-resize-handle"
                aria-label="Resize image"
                onMouseDown={startResize}
            />
        </span>
    );
}
