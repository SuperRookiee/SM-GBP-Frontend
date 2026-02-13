import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { SampleItem } from "@/types/sample.types";

interface SampleTableProps {
    rows: SampleItem[];
    loading?: boolean;
    onEdit: (item: SampleItem) => void;
    onDelete: (item: SampleItem) => void;
}

const SampleTable = ({ rows, loading = false, onEdit, onDelete }: SampleTableProps) => {
    if (loading) {
        return <p className="rounded-lg border p-4 text-sm text-muted-foreground">Loading samples...</p>;
    }

    if (!rows.length) {
        return <p className="rounded-lg border p-4 text-sm text-muted-foreground">No data found.</p>;
    }

    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>{item.id}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{item.status}</TableCell>
                            <TableCell>{item.active ? "true" : "false"}</TableCell>
                            <TableCell className="flex justify-end gap-2">
                                <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
                                    Edit
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => onDelete(item)}>
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default SampleTable;
