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

export type ISampleApiItem = ISampleRow;

export interface ISampleUpsertPayload {
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
}

export interface ISampleListResponse {
    content: ISampleApiItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export interface ISampleListRequest {
    page: number;
    size: number;
    query?: string;
    filterKey?: string;
    sortKey?: string;
    sortDirection?: "asc" | "desc";
}
