// #. 값을 지정 범위로 제한
export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// #. RGB(0~255)를 #RRGGBB 문자열로 변환
export const rgbToHex = (r: number, g: number, b: number) => `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;

// #. RGB / #RRGGBB 형식을 RGB 객체로 파싱
export const hexToRgb = (hex: string) => {
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

// #. RGB를 HSV로 변환 (컬러피커 좌표 계산용)
export const rgbToHsv = (r: number, g: number, b: number) => {
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
export const hsvToRgb = (h: number, s: number, v: number) => {
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

// #. HSV를 #RRGGBB로 바로 변환
export const hsvToHex = (h: number, s: number, v: number) => {
    const {r, g, b} = hsvToRgb(h, s, v);
    return rgbToHex(r, g, b);
};

// #. 입력 문자열(hex/rgb/rgba/transparent)을 내부 색상 표현으로 정규화
export const parseColor = (value: string) => {
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
