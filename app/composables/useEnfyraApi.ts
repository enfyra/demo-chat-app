import type { FetchOptions } from 'ofetch';

export const useEnfyraApi = () => {
  const apiFetch = async <T = unknown>(path: string, options: FetchOptions = {}): Promise<T> => {
    const { method, ...rest } = options;
    const serverHeaders = import.meta.server ? useRequestHeaders(['cookie']) : {};
    return $fetch<T>(`/enfyra${path}`, {
      ...rest,
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...serverHeaders,
        ...options.headers,
      },
    } as Parameters<typeof $fetch>[1]);
  };

  const rowsOf = <T>(response: any): T[] => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  };

  const filterCountOf = (response: any): number | null => {
    const value = response?.meta?.filterCount;
    return typeof value === 'number' ? value : null;
  };

  const firstRowOf = <T>(response: any): T | null => rowsOf<T>(response)[0] || response?.data || response || null;

  const get = <T = unknown>(path: string, options: FetchOptions = {}) => apiFetch<T>(path, { ...options, method: 'GET' });
  const post = <T = unknown>(path: string, body?: any, options: FetchOptions = {}) => apiFetch<T>(path, { ...options, method: 'POST', body });
  const patch = <T = unknown>(path: string, body?: any, options: FetchOptions = {}) => apiFetch<T>(path, { ...options, method: 'PATCH', body });
  const del = <T = unknown>(path: string, options: FetchOptions = {}) => apiFetch<T>(path, { ...options, method: 'DELETE' });

  return {
    fetch: apiFetch,
    get,
    post,
    patch,
    del,
    rowsOf,
    filterCountOf,
    firstRowOf,
  };
};
