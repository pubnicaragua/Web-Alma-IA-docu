export type OptionalPromise<T> = Promise<T> | undefined | null | void;

export async function runOptionalAxiosRequest<T>(
  request: () => OptionalPromise<T>,
  onSuccess: (response: T) => void
): Promise<T | undefined> {
  const result = request();

  if (!result || typeof (result as Promise<T>).then !== "function") {
    return undefined;
  }

  const response = await result;
  onSuccess(response);
  return response;
}
