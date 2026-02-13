import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface SampleFilterValues {
    name: string;
    category: string;
    status: string;
    active: "all" | "true" | "false";
}

interface SampleSearchFiltersProps {
    value: SampleFilterValues;
    onChange: (next: SampleFilterValues) => void;
    onSearch: () => void;
    onReset: () => void;
}

const SampleSearchFilters = ({ value, onChange, onSearch, onReset }: SampleSearchFiltersProps) => {
    return (
        <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-5">
            <Input
                placeholder="Search name"
                value={value.name}
                onChange={(event) => onChange({ ...value, name: event.target.value })}
            />
            <Input
                placeholder="Category"
                value={value.category}
                onChange={(event) => onChange({ ...value, category: event.target.value })}
            />
            <Input
                placeholder="Status"
                value={value.status}
                onChange={(event) => onChange({ ...value, status: event.target.value })}
            />
            <Select
                value={value.active}
                onValueChange={(active) => onChange({ ...value, active: active as SampleFilterValues["active"] })}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Active" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
            </Select>
            <div className="flex gap-2">
                <Button className="flex-1" onClick={onSearch}>
                    <Search className="mr-2 h-4 w-4" /> Search
                </Button>
                <Button variant="outline" onClick={onReset}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default SampleSearchFilters;
