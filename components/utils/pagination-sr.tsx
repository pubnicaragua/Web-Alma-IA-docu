'use client'
import React from "react";

interface PaginationControls {
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
    prev: () => void;
    next: () => void;
}

interface PropTypes {
    pagination: PaginationControls;
}

export function SSRPagination({ pagination }: Readonly<PropTypes>) {

    const { page, perPage, total, lastPage, prev, next } = pagination;

    const startIndex = (page - 1) * perPage + 1;
    const endIndex = Math.min(page * perPage, total);

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
            {/* Info de resultados */}
            <div>
                <p className="text-sm text-gray-700">
                    Mostrando{" "}
                    <span className="font-medium">{total > 0 ? startIndex : 0}</span> a{" "}
                    <span className="font-medium">{endIndex}</span> de{" "}
                    <span className="font-medium">{total}</span> resultados
                </p>
            </div>

            {/* Controles */}
            <div className="flex space-x-2">
                <button
                    onClick={prev}
                    disabled={page === 1}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                    Anterior
                </button>
                <button
                    onClick={next}
                    disabled={page === lastPage}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
};
