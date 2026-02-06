import { MoreHorizontal } from "lucide-react";
import type { ActionItem } from "@/types/ActionItem.type.ts";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";

type ActionMenuProps<T> = {
    row: T;
    actions: ActionItem<T>[];
    label?: string;
};

export function ActionMenu<T>({ row, actions, label = "Actions" }: ActionMenuProps<T>) {
    if (!actions.length) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{label}</DropdownMenuLabel>
                {actions.map(action =>
                    <div key={action.id}>
                        {action.separatorBefore && <DropdownMenuSeparator/>}
                        <DropdownMenuItem
                            disabled={action.disabled}
                            className={action.destructive ? "text-destructive" : undefined}
                            onClick={() => action.onSelect(row)}
                        >
                            {action.label}
                        </DropdownMenuItem>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
