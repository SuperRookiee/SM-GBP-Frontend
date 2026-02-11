declare module "tui-grid" {
    export type RowKey = number | string;

    export interface GridOptions {
        [key: string]: unknown;
    }

    export interface FocusedCell {
        rowKey?: RowKey;
    }

    export default class Grid {
        constructor(options: GridOptions);
        resetData(data: unknown[]): void;
        showColumn(columnName: string): void;
        hideColumn(columnName: string): void;
        setFrozenColumnCount(count: number): void;
        appendRow(row: unknown, options?: { at?: number; focus?: boolean }): void;
        getCheckedRowKeys(): number[];
        getFocusedCell(): FocusedCell | null;
        removeRow(rowKey: number): void;
        sort(columnName: string, ascending?: boolean, multiple?: boolean): void;
        showLoading(): void;
        hideLoading(): void;
        getData(): unknown[];
        on(eventName: string, callback: (event: unknown) => void): void;
        destroy(): void;
    }
}
