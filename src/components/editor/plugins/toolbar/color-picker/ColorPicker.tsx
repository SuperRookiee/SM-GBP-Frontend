import {useCallback, useRef, useState} from "react";
import {clamp, hexToRgb, hsvToHex, parseColor, rgbToHex, rgbToHsv} from "@/utils/editor/colorUtils.ts";
import {Button} from "@/components/ui/button.tsx";

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

    const applyHsv = useCallback((nextHsv: {h: number; s: number; v: number}) => {
        setHsv(nextHsv);
        const nextHex = hsvToHex(nextHsv.h, nextHsv.s, nextHsv.v);
        setHexInput(nextHex);
        onChange(nextHex);
    }, [onChange]);

    const updateFromSvPointer = useCallback((clientX: number, clientY: number) => {
        if (!svRef.current) return;
        const rect = svRef.current.getBoundingClientRect();
        const s = clamp((clientX - rect.left) / rect.width, 0, 1);
        const v = clamp(1 - (clientY - rect.top) / rect.height, 0, 1);
        applyHsv({...hsv, s, v});
    }, [applyHsv, hsv]);

    const updateFromHuePointer = useCallback((clientX: number) => {
        if (!hueRef.current) return;
        const rect = hueRef.current.getBoundingClientRect();
        const h = clamp(((clientX - rect.left) / rect.width) * 360, 0, 360);
        applyHsv({...hsv, h});
    }, [applyHsv, hsv]);

    const handleHexCommit = () => {
        const candidate = hexInput.startsWith("#") ? hexInput : `#${hexInput}`;
        const parsed = hexToRgb(candidate);
        if (!parsed) return;
        const nextHex = rgbToHex(parsed.r, parsed.g, parsed.b);
        setHexInput(nextHex);
        setHsv(rgbToHsv(parsed.r, parsed.g, parsed.b));
        onChange(nextHex);
    };

    const startDragGuard = () => {
        document.body.style.userSelect = "none";
        onDragStateChange?.(true);
    };

    const stopDragGuard = () => {
        document.body.style.userSelect = "";
        onDragStateChange?.(false);
    };

    return (
        <div className="demo-editor-color-picker">
            <div className="demo-editor-color-picker-row">
                <span className="demo-editor-color-picker-label">Hex</span>
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
                <div className="demo-editor-color-sv-overlay-white"/>
                <div className="demo-editor-color-sv-overlay-black"/>
                <div className="demo-editor-color-sv-thumb" style={{left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`}}/>
            </div>

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
                <div className="demo-editor-color-hue-thumb" style={{left: `${(hsv.h / 360) * 100}%`}}/>
            </div>

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

export default ColorPicker;
