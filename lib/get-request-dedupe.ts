type DedupeConfig = {
  recentTtlMs?: number;
};

type RequestConfig = {
  params?: unknown;
};

type CacheEntry<T> = {
  expiresAt: number;
  response: T;
};

const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`)
    .join(",")}}`;
};

export const buildGetRequestKey = (url: string, config?: RequestConfig): string => {
  return `${url}?${stableStringify(config?.params ?? {})}`;
};

export function createGetRequestDeduper({ recentTtlMs = 750 }: DedupeConfig = {}) {
  const pendingRequests = new Map<string, Promise<unknown>>();
  const recentResponses = new Map<string, CacheEntry<unknown>>();

  return async function dedupeGet<T>(
    url: string,
    config: RequestConfig | undefined,
    request: () => Promise<T>
  ): Promise<T> {
    const key = buildGetRequestKey(url, config);
    const now = Date.now();
    const recent = recentResponses.get(key);

    if (recent && recent.expiresAt > now) {
      return recent.response as T;
    }

    const pending = pendingRequests.get(key);
    if (pending) {
      return pending as Promise<T>;
    }

    const promise = request()
      .then((response) => {
        recentResponses.set(key, {
          expiresAt: Date.now() + recentTtlMs,
          response,
        });
        return response;
      })
      .finally(() => {
        pendingRequests.delete(key);
      });

    pendingRequests.set(key, promise);
    return promise;
  };
}
