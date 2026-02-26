export type TextFormat = "bold" | "italic" | "underline" | "strikethrough" | "code";
export type BlockType = "paragraph" | "h1" | "h2" | "h3" | "quote";

export type SavedRangePoint = {
    key: string;
    offset: number;
    type: "text" | "element";
};

export type SavedRangeSelection = {
    anchor: SavedRangePoint;
    focus: SavedRangePoint;
};

export const fontOptions = ["Arial", "Georgia", "Times New Roman", "Courier New", "Verdana", "Trebuchet MS"];
export const toolbarButtonClass = "demo-editor-toolbar-button";
