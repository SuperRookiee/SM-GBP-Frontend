export type ActionItem<T> = {
    id: string;
    label: string;
    onSelect?: (row: T) => void;
    href?: (row: T) => string;
    disabled?: boolean;
    destructive?: boolean;
    separatorBefore?: boolean;
};