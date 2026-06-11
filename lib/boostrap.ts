"use client";

import { createApiAxiosInstante } from "./axios";

export function ensureWindowAxios() {
  if (typeof window === "undefined") {
    return;
  }

  if (!window.axios) {
    window.axios = createApiAxiosInstante();
  }
}


