export type DemoGridCategory = "전자기기" | "생활용품" | "패션" | "사무용품";
export type DemoGridStatus = "판매중" | "품절" | "품절임박";

export interface IDemoGridTableRow {
  id: number;
  product: string;
  category: DemoGridCategory;
  price: number;
  stock: number;
  status: DemoGridStatus;
  launchDate: string;
  discontinued: "Y" | "N";
  _attributes?: {
    className?: {
      row?: string[];
    };
  };
}

export type DemoGridSortDirection = "asc" | "desc";

export interface IDemoGridSortOption {
  key: keyof Pick<IDemoGridTableRow, "price" | "stock" | "launchDate" | "product" | "category" | "status">;
  direction: DemoGridSortDirection;
}

export interface IDemoGridTableSampleDataParams {
  keyword?: string;
  dateFrom?: string;
  dateTo?: string;
  includeDiscontinued?: boolean;
  sorters?: IDemoGridSortOption[];
}
