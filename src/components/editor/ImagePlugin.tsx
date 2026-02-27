import {useEffect} from "react";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {$getRoot, $getSelection, $insertNodes, $isRangeSelection, COMMAND_PRIORITY_EDITOR, PASTE_COMMAND} from "lexical";
import {INSERT_IMAGE_COMMAND, $createImageNode} from "@/components/editor/nodes/ImageNode.tsx";

const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        // #. 이미지 파일을 에디터에 바로 넣기 위해 data URL로 변환
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });

const insertImage = (src: string, altText = "") => {
    if (!src) return;
    const imageNode = $createImageNode({src, altText});
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
        // #. 선택 지점에 이미지를 인라인으로 삽입
        $insertNodes([imageNode]);
        return;
    }
    // #. 선택이 없으면 루트 끝에 이미지 추가
    $getRoot().append(imageNode);
};

const getImageFileFromDataTransfer = (dataTransfer: DataTransfer | null | undefined) => {
    // #. clipboard items 기반 이미지 추출
    const items = dataTransfer?.items;
    if (items?.length) {
        const imageItem = Array.from(items).find((item) => item.type.startsWith("image/"));
        if (imageItem) return imageItem.getAsFile();
    }

    // #. 일부 브라우저/클립보드에서 files만 채워지는 케이스 대응
    const files = dataTransfer?.files;
    if (!files?.length) return null;
    return Array.from(files).find((file) => file.type.startsWith("image/")) ?? null;
};

export default function ImagePlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerCommand(
            INSERT_IMAGE_COMMAND,
            ({src, altText}) => {
                // #. 커맨드 진입점에서 실제 노드 삽입 수행
                editor.update(() => {
                    insertImage(src, altText);
                });
                return true;
            },
            COMMAND_PRIORITY_EDITOR,
        );
    }, [editor]);

    useEffect(() => {
        return editor.registerCommand(
            PASTE_COMMAND,
            (event) => {
                // #. Lexical paste 커맨드 경로에서 클립보드 이미지 처리
                const clipboardEvent = event as ClipboardEvent | null;
                const file = getImageFileFromDataTransfer(clipboardEvent?.clipboardData);
                if (!file) return false;

                void fileToDataUrl(file).then((dataUrl) => {
                    editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                        src: dataUrl,
                        altText: file.name || "clipboard-image",
                    });
                });
                return true;
            },
            COMMAND_PRIORITY_EDITOR,
        );
    }, [editor]);

    useEffect(() => {
        const onPaste = (event: ClipboardEvent) => {
            // #. 브라우저별 차이를 보완하기 위한 DOM paste fallback
            const file = getImageFileFromDataTransfer(event.clipboardData);
            if (!file) return;
            event.preventDefault();
            void fileToDataUrl(file).then((dataUrl) => {
                editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                    src: dataUrl,
                    altText: file.name || "clipboard-image",
                });
            });
        };

        return editor.registerRootListener((root, prevRoot) => {
            prevRoot?.removeEventListener("paste", onPaste);
            root?.addEventListener("paste", onPaste);
        });
    }, [editor]);

    return null;
}
