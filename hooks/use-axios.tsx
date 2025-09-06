'use client'

import { useEffect, useState, useCallback, useRef } from "react";
import axios, { AxiosResponse } from "axios";
import type { DependencyList } from "react";

type UseAxiosResult<T> = {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
    execute: (fn?: () => Promise<AxiosResponse<T>>) => void;
};

export function useAxios<T>(
    requestFn: (() => Promise<AxiosResponse<T>>) | null = null,
    deps: DependencyList = []
): UseAxiosResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const requestRef = useRef(requestFn);
    useEffect(() => {
        requestRef.current = requestFn;
    }, [requestFn]);

    const fetchData = useCallback((customFn?: () => Promise<AxiosResponse<T>>) => {
        const fn = customFn || requestRef.current;
        if (!fn) return; // Si no hay función, no ejecuta nada

        setLoading(true);
        setError(null);

        fn()
            .then((res) => setData(res.data))
            .catch((err) => {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.message || err.message);
                } else {
                    setError("Ocurrió un error inesperado");
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const execute = useCallback(async (customFn?: () => Promise<AxiosResponse<T>>) => {
        const fn = customFn || requestRef.current;
        if (!fn) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fn();
            setData(res.data);
            return res;
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
    }, []);

    useEffect(() => {
        if (requestFn) {
            fetchData();
        }
    }, [fetchData, ...deps]);

    return { data, loading, error, refetch: fetchData, execute };
}

export function useAxiosPost<T, V>(
    url: string,
    config?: Record<string, any>
): UseAxiosPostResult<T, V> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const postData = useCallback(
        async (body: V) => {
            setLoading(true);
            setError(null);
            try {
                const res: AxiosResponse<T> = await axios.post(url, body, config);
                setData(res.data);
            } catch (err: unknown) {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.message || err.message);
                } else {
                    setError("Ocurrió un error inesperado");
                }
            } finally {
                setLoading(false);
            }
        },
        [url, config]
    );

    return { data, loading, error, postData };
}