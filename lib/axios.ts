import axios from 'axios'
import type { AxiosInstance } from 'axios';
import { getAuthToken } from './api-config';

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
        return config;
    });

    return api
}

