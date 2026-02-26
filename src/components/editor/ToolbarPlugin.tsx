import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND} from "@lexical/list";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {$createHeadingNode, $isHeadingNode, QuoteNode} from "@lexical/rich-text";
import {$getSelectionStyleValueForProperty, $patchStyleText, $setBlocksType} from "@lexical/selection";
import {mergeRegister} from "@lexical/utils";
import type {ElementFormatType} from "lexical";
import {$createParagraphNode, $getSelection, $isRangeSelection, CAN_REDO_COMMAND, CAN_UNDO_COMMAND, COMMAND_PRIORITY_LOW, FORMAT_ELEMENT_COMMAND, FORMAT_TEXT_COMMAND, INDENT_CONTENT_COMMAND, OUTDENT_CONTENT_COMMAND, REDO_COMMAND, SELECTION_CHANGE_COMMAND, UNDO_COMMAND} from "lexical";
import {AlignLeft, Bold, ChevronDown, Code, Heading, Highlighter, Indent, Italic, List, ListOrdered, Minus, Plus, Redo2, Strikethrough, Underline, Undo2} from "lucide-react";
import {cn} from "@/utils/utils.ts";
import {Button} from "@/components/ui/button.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";

type TextFormat = "bold" | "italic" | "underline" | "strikethrough" | "code";
type BlockType = "paragraph" | "h1" | "h2" | "h3" | "quote";

const fontOptions = ["Arial", "Georgia", "Times New Roman", "Courier New", "Verdana", "Trebuchet MS"];
const toolbarButtonClass = "demo-editor-toolbar-button";

// #. 색상 계산에서 반복되는 범위 제한 로직을 공통 함수로 분리
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const rgbToHex = (r: number, g: number, b: number) => `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;

// #. hex 문자열을 RGB로 변환
const hexToRgb = (hex: string) => {
    const normalized = hex.trim().toLowerCase();
    const compact = normalized.startsWith("#") ? normalized.slice(1) : normalized;
    if (compact.length !== 3 && compact.length !== 6) return null;
    const full = compact.length === 3 ? compact.split("").map((char) => `${char}${char}`).join("") : compact;
    const r = Number.parseInt(full.slice(0, 2), 16);
    const g = Number.parseInt(full.slice(2, 4), 16);
    const b = Number.parseInt(full.slice(4, 6), 16);
    if ([r, g, b].some((value) => Number.isNaN(value))) return null;
    return {r, g, b};
};

// #. RGB를 HSV로 변환
const rgbToHsv = (r: number, g: number, b: number) => {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const delta = max - min;
    let h = 0;
    if (delta !== 0) {
        if (max === rn) h = ((gn - bn) / delta) % 6;
        else if (max === gn) h = (bn - rn) / delta + 2;
        else h = (rn - gn) / delta + 4;
        h *= 60;
        if (h < 0) h += 360;
    }
    const s = max === 0 ? 0 : delta / max;
    const v = max;
    return {h, s, v};
};

// #. HSV를 RGB로 변환
const hsvToRgb = (h: number, s: number, v: number) => {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    const [rPrime, gPrime, bPrime] = h < 60
        ? [c, x, 0]
        : h < 120
            ? [x, c, 0]
            : h < 180
                ? [0, c, x]
                : h < 240
                    ? [0, x, c]
                    : h < 300
                        ? [x, 0, c]
                        : [c, 0, x];
    return {
        r: Math.round((rPrime + m) * 255),
        g: Math.round((gPrime + m) * 255),
        b: Math.round((bPrime + m) * 255),
    };
};

// #. HSV를 hex 문자열로 변환
const hsvToHex = (h: number, s: number, v: number) => {
    const {r, g, b} = hsvToRgb(h, s, v);
    return rgbToHex(r, g, b);
};

const parseColor = (value: string) => {
    // hex/rgb(a)/transparent 형태를 단일 파서로 정규화해 ColorPicker 상태를 단순화
    const normalized = value.trim().toLowerCase();
    if (!normalized || normalized === "transparent") return {kind: "transparent" as const};
    const hexRgb = hexToRgb(normalized);
    if (hexRgb) return {kind: "rgb" as const, ...hexRgb};
    const rgbMatch = normalized.match(/^rgba?\(([^)]+)\)$/);
    if (!rgbMatch) return null;
    const parts = rgbMatch[1].split(",").map((part) => part.trim());
    if (parts.length < 3) return null;
    const r = Number.parseInt(parts[0], 10);
    const g = Number.parseInt(parts[1], 10);
    const b = Number.parseInt(parts[2], 10);
    if ([r, g, b].some((channel) => Number.isNaN(channel))) return null;
    return {kind: "rgb" as const, r: clamp(r, 0, 255), g: clamp(g, 0, 255), b: clamp(b, 0, 255)};
};

interface IColorPickerProps {
    value: string;
    onChange: (value: string) => void;
    allowTransparent?: boolean;
    clearLabel?: string;
    onClear?: () => void;
    onDragStateChange?: (isDragging: boolean) => void;
}

const ColorPicker = ({value, onChange, allowTransparent = false, clearLabel, onClear, onDragStateChange}: IColorPickerProps) => {
    const svRef = useRef<HTMLDivElement>(null);
    const hueRef = useRef<HTMLDivElement>(null);
    const initialParsed = parseColor(value);
    const initialRgb = initialParsed && initialParsed.kind === "rgb" ? initialParsed : {r: 0, g: 0, b: 0};
    const [hsv, setHsv] = useState(() => rgbToHsv(initialRgb.r, initialRgb.g, initialRgb.b));
    const [hexInput, setHexInput] = useState(() => rgbToHex(initialRgb.r, initialRgb.g, initialRgb.b));

    // #. HSV 변경값을 상태/UI/외부 onChange에 동시에 반영
    const applyHsv = useCallback((nextHsv: {h: number; s: number; v: number}) => {
        setHsv(nextHsv);
        const nextHex = hsvToHex(nextHsv.h, nextHsv.s, nextHsv.v);
        setHexInput(nextHex);
        onChange(nextHex);
    }, [onChange]);

    // #. 포인터 위치로 채도/명도(S/V)를 계산
    const updateFromSvPointer = useCallback((clientX: number, clientY: number) => {
        if (!svRef.current) return;
        const rect = svRef.current.getBoundingClientRect();
        const s = clamp((clientX - rect.left) / rect.width, 0, 1);
        const v = clamp(1 - (clientY - rect.top) / rect.height, 0, 1);
        applyHsv({...hsv, s, v});
    }, [applyHsv, hsv]);

    // #. 포인터 위치로 색상(H)을 계산
    const updateFromHuePointer = useCallback((clientX: number) => {
        if (!hueRef.current) return;
        const rect = hueRef.current.getBoundingClientRect();
        const h = clamp(((clientX - rect.left) / rect.width) * 360, 0, 360);
        applyHsv({...hsv, h});
    }, [applyHsv, hsv]);

    // #. Hex 입력값을 검증 후 실제 색상 상태로 반영
    const handleHexCommit = () => {
        const candidate = hexInput.startsWith("#") ? hexInput : `#${hexInput}`;
        const parsed = hexToRgb(candidate);
        if (!parsed) return;
        const nextHex = rgbToHex(parsed.r, parsed.g, parsed.b);
        setHexInput(nextHex);
        setHsv(rgbToHsv(parsed.r, parsed.g, parsed.b));
        onChange(nextHex);
    };

    // #. 드래그 중 텍스트 선택 방지를 시작
    const startDragGuard = () => {
        document.body.style.userSelect = "none";
        onDragStateChange?.(true);
    };

    // #. 드래그 종료 후 텍스트 선택 방지를 해제
    const stopDragGuard = () => {
        document.body.style.userSelect = "";
        onDragStateChange?.(false);
    };

    return (
        // 색상 선택기 전체 컨테이너
        <div className="demo-editor-color-picker">
            {/* Hex 입력 영역 */}
            <div className="demo-editor-color-picker-row">
                {/* Hex 라벨 */}
                <span className="demo-editor-color-picker-label">Hex</span>
                {/* Hex 입력 필드 */}
                <input
                    className="demo-editor-color-hex-input"
                    value={hexInput}
                    onChange={(event) => setHexInput(event.target.value)}
                    onBlur={handleHexCommit}
                    onKeyDown={(event) => {
                        if (event.key !== "Enter") return;
                        event.preventDefault();
                        handleHexCommit();
                    }}
                />
            </div>

            {/* 채도/명도 선택 영역 */}
            <div
                ref={svRef}
                className="demo-editor-color-sv"
                style={{backgroundColor: `hsl(${hsv.h} 100% 50%)`}}
                onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    startDragGuard();
                    updateFromSvPointer(event.clientX, event.clientY);
                    const move = (moveEvent: MouseEvent) => {
                        moveEvent.preventDefault();
                        updateFromSvPointer(moveEvent.clientX, moveEvent.clientY);
                    };
                    const up = () => {
                        window.removeEventListener("mousemove", move);
                        window.removeEventListener("mouseup", up);
                        stopDragGuard();
                    };
                    window.addEventListener("mousemove", move);
                    window.addEventListener("mouseup", up);
                }}
            >
                {/* SV 흰색 그라데이션 오버레이 */}
                <div className="demo-editor-color-sv-overlay-white"/>
                {/* SV 검정 그라데이션 오버레이 */}
                <div className="demo-editor-color-sv-overlay-black"/>
                {/* SV 현재 위치 썸 */}
                <div className="demo-editor-color-sv-thumb" style={{left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`}}/>
            </div>

            {/* 색상(H) 선택 슬라이더 */}
            <div
                ref={hueRef}
                className="demo-editor-color-hue"
                onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    startDragGuard();
                    updateFromHuePointer(event.clientX);
                    const move = (moveEvent: MouseEvent) => {
                        moveEvent.preventDefault();
                        updateFromHuePointer(moveEvent.clientX);
                    };
                    const up = () => {
                        window.removeEventListener("mousemove", move);
                        window.removeEventListener("mouseup", up);
                        stopDragGuard();
                    };
                    window.addEventListener("mousemove", move);
                    window.addEventListener("mouseup", up);
                }}
            >
                {/* H 현재 위치 썸 */}
                <div className="demo-editor-color-hue-thumb" style={{left: `${(hsv.h / 360) * 100}%`}}/>
            </div>

            {/* 투명/초기화 버튼 */}
            {allowTransparent || onClear ? (
                <Button
                    variant="outline"
                    size="xs"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                        if (onClear) onClear();
                        else onChange("transparent");
                    }}
                    className="mt-2 w-full"
                >
                    {clearLabel ?? "Clear"}
                </Button>
            ) : null}
        </div>
    );
};

const EditorToolbar = () => {
    const [editor] = useLexicalComposerContext();
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [blockType, setBlockType] = useState<BlockType>("paragraph");
    const [fontFamily, setFontFamily] = useState("Arial");
    const [fontSize, setFontSize] = useState(15);
    const [fontSizeInput, setFontSizeInput] = useState("15");
    const [textColor, setTextColor] = useState("#000000");
    const [highlightColor, setHighlightColor] = useState("transparent");
    const [isTextColorOpen, setIsTextColorOpen] = useState(false);
    const [isHighlightOpen, setIsHighlightOpen] = useState(false);
    const [isTextColorDragging, setIsTextColorDragging] = useState(false);
    const [isHighlightDragging, setIsHighlightDragging] = useState(false);
    const [alignType, setAlignType] = useState<ElementFormatType>("left");
    const [formats, setFormats] = useState<Record<TextFormat, boolean>>({
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        code: false,
    });

    // #. 블록 타입 표시 라벨을 계산
    const blockLabel = useMemo(() => {
        if (blockType === "h1") return "Heading 1";
        if (blockType === "h2") return "Heading 2";
        if (blockType === "h3") return "Heading 3";
        if (blockType === "quote") return "Quote";
        return "Normal";
    }, [blockType]);
    // #. 정렬 표시 라벨을 계산
    const alignLabel = useMemo(() => {
        if (alignType === "center") return "Center Align";
        if (alignType === "right") return "Right Align";
        if (alignType === "justify") return "Justify Align";
        return "Left Align";
    }, [alignType]);

    const updateToolbar = useCallback(() => {
        // 현재 selection의 블록/텍스트 스타일을 읽어 툴바 UI 상태를 동기화
        editor.getEditorState().read(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return;

            const topLevelNode = selection.anchor.getNode().getTopLevelElementOrThrow();
            const headingType = $isHeadingNode(topLevelNode) ? topLevelNode.getTag() : undefined;
            setBlockType(
                headingType === "h1" || headingType === "h2" || headingType === "h3"
                    ? headingType
                    : topLevelNode.getType() === "quote"
                        ? "quote"
                        : "paragraph",
            );
            const nextAlign = (typeof (topLevelNode as { getFormatType?: () => string }).getFormatType === "function")
                ? (topLevelNode as { getFormatType: () => string }).getFormatType()
                : "left";
            setAlignType(
                nextAlign === "center" || nextAlign === "right" || nextAlign === "justify"
                    ? nextAlign
                    : "left",
            );
            setFormats({
                bold: selection.hasFormat("bold"),
                italic: selection.hasFormat("italic"),
                underline: selection.hasFormat("underline"),
                strikethrough: selection.hasFormat("strikethrough"),
                code: selection.hasFormat("code"),
            });

            setFontFamily($getSelectionStyleValueForProperty(selection, "font-family", "Arial").replaceAll("\"", ""));
            const resolvedSize = Number.parseInt($getSelectionStyleValueForProperty(selection, "font-size", "15px"), 10);
            const nextFontSize = Number.isNaN(resolvedSize) ? 15 : resolvedSize;
            setFontSize(nextFontSize);
            setFontSizeInput(String(nextFontSize));
            setTextColor($getSelectionStyleValueForProperty(selection, "color", "#000000"));
            setHighlightColor($getSelectionStyleValueForProperty(selection, "background-color", "transparent"));
        });
    }, [editor]);

    // #. 선택 블록 타입(문단/헤딩/인용)을 적용
    const applyHeading = (type: BlockType) => {
        editor.update(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return;
            if (type === "paragraph") return $setBlocksType(selection, () => $createParagraphNode());
            if (type === "h1" || type === "h2" || type === "h3") return $setBlocksType(selection, () => $createHeadingNode(type));
            $setBlocksType(selection, () => new QuoteNode());
        });
    };

    // #. 선택 텍스트에 CSS 스타일을 패치
    const applyTextStyle = (styles: Record<string, string>) => {
        editor.update(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return;
            $patchStyleText(selection, styles);
        });
    };

    // #. 블록 정렬을 적용
    const applyAlign = (alignType: ElementFormatType) => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignType);
        setAlignType(alignType);
    };
    // #. 글자색을 초기화
    const clearTextColor = () => {
        applyTextStyle({color: "inherit"});
        setTextColor("inherit");
    };
    // #. 형광색을 초기화
    const clearHighlight = () => {
        applyTextStyle({"background-color": "transparent"});
        setHighlightColor("transparent");
    };

    // #. 글자 크기를 범위 제한 후 적용
    const applyFontSize = (nextSize: number) => {
        const clamped = Math.min(72, Math.max(10, nextSize));
        setFontSize(clamped);
        setFontSizeInput(String(clamped));
        applyTextStyle({"font-size": `${clamped}px`});
    };

    // #. 글자 크기 입력값을 확정
    const commitFontSizeInput = () => {
        const parsed = Number.parseInt(fontSizeInput, 10);
        if (Number.isNaN(parsed)) return setFontSizeInput(String(fontSize));
        applyFontSize(parsed);
    };

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(() => updateToolbar()),
            editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
                updateToolbar();
                return false;
            }, COMMAND_PRIORITY_LOW),
            editor.registerCommand(CAN_UNDO_COMMAND, (payload) => {
                setCanUndo(payload);
                return false;
            }, COMMAND_PRIORITY_LOW),
            editor.registerCommand(CAN_REDO_COMMAND, (payload) => {
                setCanRedo(payload);
                return false;
            }, COMMAND_PRIORITY_LOW),
        );
    }, [editor, updateToolbar]);

    return (
        // 상단 고정 툴바 전체
        <div className="demo-editor-toolbar">
            {/* 실행 취소/다시 실행 그룹 */}
            <div className="demo-editor-toolbar-group">
                <Button variant="ghost" size="icon-sm" className={toolbarButtonClass} disabled={!canUndo} onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}><Undo2 size={16}/></Button>
                <Button variant="ghost" size="icon-sm" className={toolbarButtonClass} disabled={!canRedo} onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}><Redo2 size={16}/></Button>
            </div>

            {/* 블록/폰트/크기 그룹 */}
            <div className="demo-editor-toolbar-group">
                {/* 블록 타입 선택 */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="demo-editor-toolbar-trigger min-w-40 justify-between"><span className="inline-flex items-center gap-2"><Heading size={15}/>{blockLabel}</span><ChevronDown size={15}/></Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="min-w-56 p-1">
                        <Button variant="ghost" className="w-full justify-start" onClick={() => applyHeading("paragraph")}>Normal</Button>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => applyHeading("h1")}>Heading 1</Button>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => applyHeading("h2")}>Heading 2</Button>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => applyHeading("h3")}>Heading 3</Button>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => applyHeading("quote")}>Quote</Button>
                    </PopoverContent>
                </Popover>

                {/* 폰트 선택 */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="demo-editor-toolbar-trigger min-w-32 justify-between"><span className="truncate">{fontFamily}</span><ChevronDown size={15}/></Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="min-w-56 p-1">
                        {fontOptions.map((font) => <Button key={font} variant="ghost" className="w-full justify-start" onClick={() => applyTextStyle({"font-family": font})} style={{fontFamily: font}}>{font}</Button>)}
                    </PopoverContent>
                </Popover>

                {/* 폰트 크기 증감/입력 */}
                <div className="demo-editor-font-size-control">
                    <Button variant="ghost" size="icon-sm" className={toolbarButtonClass} onClick={() => applyFontSize(fontSize - 1)}><Minus size={15}/></Button>
                    <input type="number" min={10} max={72} step={1} inputMode="numeric" className="demo-editor-font-size-input" value={fontSizeInput} onChange={(event) => setFontSizeInput(event.target.value)} onBlur={commitFontSizeInput}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                commitFontSizeInput();
                                (event.currentTarget as HTMLInputElement).blur();
                            }
                        }}/>
                    <Button variant="ghost" size="icon-sm" className={toolbarButtonClass} onClick={() => applyFontSize(fontSize + 1)}><Plus size={15}/></Button>
                </div>
            </div>

            {/* 리스트/텍스트색/형광색 그룹 */}
            <div className="demo-editor-toolbar-group">
                {/* 리스트 명령 메뉴 */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className={toolbarButtonClass}><List size={15}/></Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="p-1">
                        <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}><List size={15}/>Bullet List</Button>
                        <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}><ListOrdered size={15}/>Numbered List</Button>
                        <div className="my-1 border-t"/>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)}>Clear List</Button>
                    </PopoverContent>
                </Popover>

                {/* 텍스트 색상 선택 */}
                <Popover
                    open={isTextColorOpen}
                    onOpenChange={(open) => {
                        setIsTextColorOpen(open);
                        if (!open) setIsTextColorDragging(false);
                    }}
                >
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className={toolbarButtonClass} onMouseDown={(event) => event.preventDefault()}><span className="demo-editor-color-icon" style={{color: textColor}}>A</span></Button>
                    </PopoverTrigger>
                    <PopoverContent
                        align="start"
                        className="demo-editor-color-popover"
                        onOpenAutoFocus={(event) => event.preventDefault()}
                        onInteractOutside={(event) => {
                            if (isTextColorDragging) event.preventDefault();
                        }}
                    >
                        <ColorPicker
                            value={textColor}
                            onChange={(color) => applyTextStyle({color})}
                            clearLabel="Clear"
                            onClear={clearTextColor}
                            onDragStateChange={setIsTextColorDragging}
                        />
                    </PopoverContent>
                </Popover>

                {/* 하이라이트 색상 선택 */}
                <Popover
                    open={isHighlightOpen}
                    onOpenChange={(open) => {
                        setIsHighlightOpen(open);
                        if (!open) setIsHighlightDragging(false);
                    }}
                >
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className={toolbarButtonClass} onMouseDown={(event) => event.preventDefault()}>
                            <Highlighter size={14} style={{color: highlightColor === "transparent" ? "currentColor" : highlightColor}}/>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        align="start"
                        className="demo-editor-color-popover"
                        onOpenAutoFocus={(event) => event.preventDefault()}
                        onInteractOutside={(event) => {
                            if (isHighlightDragging) event.preventDefault();
                        }}
                    >
                        <ColorPicker
                            value={highlightColor}
                            onChange={(color) => applyTextStyle({"background-color": color})}
                            allowTransparent
                            clearLabel="Clear"
                            onClear={clearHighlight}
                            onDragStateChange={setIsHighlightDragging}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* 인라인 포맷 그룹 */}
            <div className="demo-editor-toolbar-group">
                <Button variant="ghost" size="icon-sm" className={cn(toolbarButtonClass, formats.bold && "is-active")} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}><Bold size={15}/></Button>
                <Button variant="ghost" size="icon-sm" className={cn(toolbarButtonClass, formats.italic && "is-active")} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}><Italic size={15}/></Button>
                <Button variant="ghost" size="icon-sm" className={cn(toolbarButtonClass, formats.underline && "is-active")} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}><Underline size={15}/></Button>
                <Button variant="ghost" size="icon-sm" className={cn(toolbarButtonClass, formats.strikethrough && "is-active")} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}><Strikethrough size={15}/></Button>
                <Button variant="ghost" size="icon-sm" className={cn(toolbarButtonClass, formats.code && "is-active")} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}><Code size={15}/></Button>
            </div>

            {/* 정렬/들여쓰기 그룹 */}
            <div className="demo-editor-toolbar-group">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="demo-editor-toolbar-trigger min-w-34 justify-between"><span className="inline-flex items-center gap-2"><AlignLeft size={15}/>{alignLabel}</span><ChevronDown size={15}/></Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="min-w-52 p-1">
                        <Button variant="ghost" className="w-full justify-start" onClick={() => applyAlign("left")}>Left Align</Button>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => applyAlign("center")}>Center Align</Button>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => applyAlign("right")}>Right Align</Button>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => applyAlign("justify")}>Justify Align</Button>
                        <div className="my-1 border-t"/>
                        <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)}><Indent size={15} className="rotate-180"/>Outdent</Button>
                        <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)}><Indent size={15}/>Indent</Button>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
};

const SelectionFloatingToolbar = () => {
    const [editor] = useLexicalComposerContext();
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
    const [formats, setFormats] = useState<Record<TextFormat, boolean>>({
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        code: false
    });

    // 선택 영역 근처 플로팅 툴바 위치/상태를 동기화
    const syncSelectionToolbar = useCallback(() => {
        editor.getEditorState().read(() => {
            const selection = $getSelection();
            const rootElement = editor.getRootElement();
            if (!$isRangeSelection(selection) || selection.isCollapsed() || !rootElement) {
                setPosition(null);
                return;
            }

            const nativeSelection = window.getSelection();
            if (!nativeSelection || nativeSelection.rangeCount === 0) {
                setPosition(null);
                return;
            }

            const range = nativeSelection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) {
                setPosition(null);
                return;
            }

            setFormats({
                bold: selection.hasFormat("bold"),
                italic: selection.hasFormat("italic"),
                underline: selection.hasFormat("underline"),
                strikethrough: selection.hasFormat("strikethrough"),
                code: selection.hasFormat("code"),
            });

            // 플로팅 툴바가 화면 밖으로 나가지 않도록 좌우/상하 위치를 보정
            const viewportMargin = 8;
            const toolbarWidth = toolbarRef.current?.offsetWidth ?? 420;
            const toolbarHeight = toolbarRef.current?.offsetHeight ?? 44;
            const desiredLeft = rect.left + rect.width / 2;
            const clampedLeft = Math.max(
                viewportMargin + toolbarWidth / 2,
                Math.min(window.innerWidth - viewportMargin - toolbarWidth / 2, desiredLeft),
            );
            const placeAboveTop = rect.top - toolbarHeight - 8;
            const top = placeAboveTop < viewportMargin ? rect.bottom + 8 : placeAboveTop;

            setPosition({top, left: clampedLeft});
        });
    }, [editor]);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(() => syncSelectionToolbar()),
            editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
                syncSelectionToolbar();
                return false;
            }, COMMAND_PRIORITY_LOW),
        );
    }, [editor, syncSelectionToolbar]);

    if (!position) return null;

    return (
        // 선택 텍스트 근처에 표시되는 플로팅 툴바
        <div ref={toolbarRef} className="demo-editor-selection-toolbar" style={{top: position.top, left: position.left}}>
            <Button variant="ghost" size="icon-sm" className={cn("demo-editor-selection-button", formats.bold && "is-active")} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}><Bold size={14}/></Button>
            <Button variant="ghost" size="icon-sm" className={cn("demo-editor-selection-button", formats.italic && "is-active")} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}><Italic size={14}/></Button>
            <Button variant="ghost" size="icon-sm" className={cn("demo-editor-selection-button", formats.underline && "is-active")} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}><Underline size={14}/></Button>
            <Button variant="ghost" size="icon-sm" className={cn("demo-editor-selection-button", formats.strikethrough && "is-active")} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}><Strikethrough size={14}/></Button>
            <Button variant="ghost" size="icon-sm" className={cn("demo-editor-selection-button", formats.code && "is-active")} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}>{"<>"}</Button>
        </div>
    );
};

export default function ToolbarPlugin() {
    return (
        <>
            {/* 메인 상단 툴바 */}
            <EditorToolbar/>
            {/* 텍스트 선택 플로팅 툴바 */}
            <SelectionFloatingToolbar/>
        </>
    );
}
