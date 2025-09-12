

export interface ServerActionResponse {
    title?: string;
    variant?: string;
    message: string;
    status: "success" | "error"
    [x: string]: unknown
}

export interface PaginationResponse<T> {
    data: T[];
    totalItems: number;
    currentPage: number;
    totalPages: number;
}
