export type ActionItem<T> = {
    id: string;
    label: string;
    onSelect: (row: T) => void;
    disabled?: boolean;
    destructive?: boolean;
    separatorBefore?: boolean;
};