'use client'

import { useEffect, useState, useCallback, useRef } from "react";
import axios, { AxiosResponse } from "axios";
import type { DependencyList } from "react";
import { runOptionalAxiosRequest, type OptionalPromise } from "@/lib/optional-axios-request";

type UseAxiosResult<T> = {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
    execute: <U = T>(customFn?: () => OptionalPromise<AxiosResponse<U>>) => Promise<AxiosResponse<U> | undefined>;
};

export function useAxios<T>(
    requestFn: (() => OptionalPromise<AxiosResponse<T>>) | null = null,
    deps: DependencyList = []
): UseAxiosResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const requestRef = useRef(requestFn);
    useEffect(() => {
        requestRef.current = requestFn;
    }, [requestFn]);

    const fetchData = useCallback((customFn?: () => OptionalPromise<AxiosResponse<T>>) => {
        const fn = customFn || requestRef.current;
        if (!fn) return;

        setLoading(true);
        setError(null);

        runOptionalAxiosRequest(fn, (res) => setData(res.data))
            .catch((err) => {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.message || err.message);
                } else {
                    setError("Ocurrió un error inesperado");
                }
            })
            .finally(() => setLoading(false));
    }, []);

    // 👇 Aquí el truco: `U` es un tipo específico para cada ejecución
    const execute = async <U = T>(
        customFn?: () => OptionalPromise<AxiosResponse<U>>
    ): Promise<AxiosResponse<U> | undefined> => {
        const fn = customFn as (() => OptionalPromise<AxiosResponse<U>>) | undefined;
        if (!fn) return Promise.resolve(undefined);

        setLoading(true);
        setError(null);

        try {
            return await runOptionalAxiosRequest(fn, (res) => {
                // solo casteamos si el tipo coincide con T
                setData(res.data as unknown as T);
            });
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || err.message);
            } else {
                setError("Ocurrió un error inesperado");
            }
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (requestFn) {
            fetchData();
        }
    }, [fetchData, ...deps]);

    return { data, loading, error, refetch: fetchData, execute };
}
