import { useEffect, useState, useCallback } from "react";
import axios, { AxiosResponse } from "axios";

type UseAxiosResult<T> = {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
};

type UseAxiosPostResult<T, V> = {
    data: T | null;
    loading: boolean;
    error: string | null;
    postData: (body: V) => Promise<void>;
};

export function useAxios<T>(requestFn: () => Promise<AxiosResponse<T>>): UseAxiosResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(() => {
        setLoading(true);
        setError(null);

        requestFn()
            .then((res) => setData(res.data))
            .catch((err) => {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.message || err.message);
                } else {
                    setError("Ocurrió un error inesperado");
                }
            })
            .finally(() => setLoading(false));
    }, [requestFn]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        refetch: fetchData
    };
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