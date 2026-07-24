import axios from 'axios'
import type { AxiosInstance } from 'axios';
import { getAuthToken } from './api-config';
import { createGetRequestDeduper } from './get-request-dedupe';

export const API_BASE_URL = "/api/proxy";

export function createApiAxiosInstante(): AxiosInstance {
    const api: AxiosInstance = axios.create({
        baseURL: API_BASE_URL,
        headers: {
            "Content-Type": "application/json",
            "Date-Zone": JSON.stringify(Intl.DateTimeFormat().resolvedOptions()),
        },
    });

    api.interceptors.request.use((config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // When sending FormData (file uploads), let the browser set the
        // correct Content-Type with the multipart boundary. The default
        // "application/json" header would prevent multer from parsing files.
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    });

    const originalGet = api.get.bind(api);
    const dedupeGet = createGetRequestDeduper();

    api.get = ((url: string, config?: any) => {
        const token = getAuthToken();
        const dedupeConfig = {
            ...config,
            params: {
                ...(config?.params ?? {}),
                __authScope: token ? token.slice(-12) : "anonymous",
            },
        };

        return dedupeGet(url, dedupeConfig, () => originalGet(url, config));
    }) as AxiosInstance["get"];

    return api
}

