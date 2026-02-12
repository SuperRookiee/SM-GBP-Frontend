import { themeQuartz } from "ag-grid-community";

export const myTheme = themeQuartz.withParams({
    /* ===== Base ===== */
    backgroundColor: "var(--color-background)",
    foregroundColor: "var(--color-foreground)",
    borderColor: "var(--color-border)",
    browserColorScheme: "light",

    /* ===== Header ===== */
    headerBackgroundColor: "var(--color-card)",
    headerTextColor: "var(--color-foreground)",
    headerFontWeight: 500,

    /* ===== Accent ===== */
    accentColor: "var(--color-primary)",

    /* ===== Row / Cell ===== */
    rowHoverColor: "color-mix(in srgb, var(--color-foreground) 3%, transparent)",
    selectedRowBackgroundColor:
        "color-mix(in srgb, var(--color-primary) 15%, transparent)",

    rowBorder: true,
    columnBorder: false,

    /* ===== Spacing ===== */
    spacing: 8,
    fontSize: 14,
    borderRadius: 12,

    chromeBackgroundColor: {
        ref: "backgroundColor",
    },
});