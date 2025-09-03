import { useCallback, useMemo, useState } from "react";

export function usePagination<T>(data: T[], size: number) {

    const sizePage = size || 10;
    const [currentPage, setCurrentPage] = useState(0);

    const currentDataTable = useMemo((): T[] => {
        if (!Array.isArray(data)) return [];
        const firstPageIndex = currentPage * sizePage;
        const lastPageIndex = firstPageIndex + sizePage;
        return data.slice(firstPageIndex, lastPageIndex);
    }, [currentPage, data]);

    const calculatePages = () => Math.ceil(data.length / sizePage);

    const prev = useCallback(() => {
        const prevPage = currentPage - 1;
        if (prevPage < 0) return;
        setCurrentPage(prevPage);
    }, [currentDataTable]);

    const next = useCallback(() => {
        const amountPages = calculatePages();
        const nextPage = currentPage + 1;
        if (nextPage >= amountPages) return;
        setCurrentPage(nextPage);
    }, [currentDataTable]);

    const first = useCallback(() => {
        setCurrentPage(0);
    }, [data]);

    const last = useCallback(() => {
        const lastPage = calculatePages() - 1;
        if (lastPage < 0) return;
        setCurrentPage(lastPage);
    }, [data]);

    const total = useMemo(() => data.length, [data]);

    return {
        page: currentPage,
        lastPage: calculatePages() - 1,
        paginated: currentDataTable,
        setPage: setCurrentPage,
        perPage: sizePage,
        total,
        prev,
        next,
        first,
        last,
    };
}
