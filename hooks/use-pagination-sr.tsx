'use client'
import { useCallback, useEffect, useMemo, useState } from "react";
import type { PaginationResponse } from "@/types/generics";
import { useAxios } from "./use-axios";

interface UsePaginationProps {
    route: string;
    filters?: Record<string, any>;
    perPage?: number;
    enabled?: boolean;
}

export function usePaginationSR<T>({ route, filters = {}, perPage = 10, enabled = true }: UsePaginationProps) {
    const [page, setPage] = useState(1);

    const requestFn = useCallback(
        () =>
            enabled
                ? window.axios.get<PaginationResponse<T>>(route, {
                    params: { ...filters, page, perPage },
                })
                : Promise.resolve({ data: { data: [], totalItems: 0, totalPages: 1 } }),
        [route, filters, page, perPage, enabled]
    );

    const { data: response, loading, error, refetch, execute } = useAxios<PaginationResponse<T>>(requestFn, [
        route,
        filters,
        page,
        perPage,
    ]);

    useEffect(() => {
        setPage(1);
    }, [filters]);

    const data = useMemo(() => response?.data ?? [], [response]);
    const total = response?.totalItems ?? 0;
    const lastPage = response?.totalPages ?? 1;

    const prev = useCallback(() => {
        setPage((p) => Math.max(p - 1, 1));
    }, []);

    const next = useCallback(() => {
        setPage((p) => Math.min(p + 1, lastPage));
    }, [lastPage]);

    const first = useCallback(() => setPage(1), []);
    const last = useCallback(() => setPage(lastPage), [lastPage]);

    return {
        data,
        loading,
        error,
        page,
        perPage,
        total,
        lastPage,
        setPage,
        prev,
        next,
        first,
        last,
        refetch,
        execute,
    };
}
