import { MoreHorizontal } from "lucide-react";
import type { ActionItem } from "@/types/ActionItem.type";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";

interface IActionMenuProps<T> {
    row: T;
    actions: ActionItem<T>[];
    label?: string;
    maxItems?: number;
}

const ActionMenu = <T, >({ row, actions, label = "Actions", maxItems }: IActionMenuProps<T>) => {
    if (!actions?.length) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" aria-label={label}>
                    <MoreHorizontal className="h-4 w-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{label}</DropdownMenuLabel>
                {(maxItems ? actions.slice(0, maxItems) : actions).map((a, i) =>
                    <div key={a.id}>
                        {!!a.separatorBefore && i > 0 && <DropdownMenuSeparator/>}
                        <DropdownMenuItem
                            disabled={a.disabled}
                            className={a.destructive ? "text-destructive" : undefined}
                            onSelect={() => !a.disabled && a.onSelect(row)}
                        >
                            {a.label}
                        </DropdownMenuItem>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ActionMenu;
