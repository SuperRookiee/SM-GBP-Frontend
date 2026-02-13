export interface ISampleRow {
    id: number;
    name: string;
    description: string;
    category: string;
    status: string;
    priority: number;
    quantity: number;
    price: number | string;
    rate: number;
    active: boolean;
    dueDate: string | null;
    memo: string | null;
    createdAt: string;
    updatedAt: string;
}
