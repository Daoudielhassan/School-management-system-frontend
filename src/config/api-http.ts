import { ENABLE_RETRY } from './api-base';
import { createLogger } from '@/lib/logger';

const httpLogger = createLogger('API/HTTP');

interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryableStatuses: number[];
}

type ApiUrlInput = string | { BASE: string };
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatuses: [500, 502, 503, 504],
};

async function executeRequest<T>(
  method: HttpMethod,
  url: string,
  init: RequestInit,
  payload?: unknown
): Promise<T> {
  const startTime = Date.now();
  const hasAuth = Boolean(init.headers && (init.headers as Record<string, string>).Authorization);

  httpLogger.logRequest(method, url, hasAuth ? '[authenticated]' : payload);

  try {
    const res = await safeFetch(url, init);
    const data = await handleResponse(res);
    httpLogger.logResponse(method, url, res.status, Date.now() - startTime, data);
    return data as T;
  } catch (error) {
    httpLogger.logApiError(method, url, error, Date.now() - startTime);
    throw error;
  }
}

function normalizeApiUrl(url: ApiUrlInput): string {
  if (typeof url === 'string') {
    if (url.includes('[object Object]')) {
      throw new Error(
        'Invalid API URL. Endpoint object was interpolated into a string; use .BASE or a concrete endpoint property.'
      );
    }
    return url;
  }

  if (url && typeof url === 'object' && typeof url.BASE === 'string') {
    return url.BASE;
  }

  throw new Error('Invalid API URL input. Expected a URL string or endpoint object with BASE.');
}

async function safeFetch(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Network error while calling ${url}: ${message}`);
  }
}

const getRetryDelay = (attempt: number, baseDelay: number = 1000): number => {
  return Math.min(baseDelay * Math.pow(2, attempt), 10000);
};

async function handleResponse(response: Response) {
  const contentType = response.headers.get('content-type');
  let data;

  if (response.status === 204) {
    data = null;
  } else {
    // Read the body exactly once as text, then parse. Reading it twice (e.g.
    // response.text() as a fallback after a failed response.json()) throws
    // "body stream already read", so parse the already-read text instead.
    const rawBody = await response.text();
    if (rawBody === '') {
      data = null;
    } else if (contentType?.includes('application/json')) {
      try {
        data = JSON.parse(rawBody);
      } catch (parseError) {
        httpLogger.warn('Failed to parse JSON response body', { url: response.url, parseError });
        data = rawBody;
      }
    } else {
      data = rawBody;
    }
  }

  if (!response.ok) {
    let errorMessage = 'API Error';
    if (data) {
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      }
    }

    const error = new Error(`${response.status}: ${errorMessage}`) as any;
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function withRetry<T>(fn: () => Promise<T>, config: RetryConfig = DEFAULT_RETRY_CONFIG): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      if (error.status && !config.retryableStatuses.includes(error.status)) {
        throw error;
      }

      if (attempt === config.maxRetries) {
        throw error;
      }

      const delay = getRetryDelay(attempt, config.retryDelay);
      httpLogger.warn(`Retry ${attempt + 1}/${config.maxRetries} after ${delay}ms`, { status: error.status, url: lastError?.message });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export async function apiGet<T = any>(url: ApiUrlInput, token?: string, enableRetry: boolean = ENABLE_RETRY): Promise<T> {
  const fetchFn = async (): Promise<T> => {
    const normalizedUrl = normalizeApiUrl(url);
    return executeRequest<T>('GET', normalizedUrl, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
    });
  };

  return enableRetry ? withRetry(fetchFn) : fetchFn();
}

export async function apiPost<T = any>(url: ApiUrlInput, data: any, token?: string, enableRetry: boolean = false): Promise<T> {
  const fetchFn = async (): Promise<T> => {
    const normalizedUrl = normalizeApiUrl(url);
    return executeRequest<T>('POST', normalizedUrl, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }, data);
  };

  return enableRetry ? withRetry(fetchFn) : fetchFn();
}

export async function apiPut<T = any>(url: ApiUrlInput, data: any, token?: string, enableRetry: boolean = false): Promise<T> {
  const fetchFn = async (): Promise<T> => {
    const normalizedUrl = normalizeApiUrl(url);
    return executeRequest<T>('PUT', normalizedUrl, {
      method: 'PUT',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }, data);
  };

  return enableRetry ? withRetry(fetchFn) : fetchFn();
}

export async function apiPatch<T = any>(url: ApiUrlInput, data: any, token?: string, enableRetry: boolean = false): Promise<T> {
  const fetchFn = async (): Promise<T> => {
    const normalizedUrl = normalizeApiUrl(url);
    return executeRequest<T>('PATCH', normalizedUrl, {
      method: 'PATCH',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }, data);
  };

  return enableRetry ? withRetry(fetchFn) : fetchFn();
}

export async function apiDelete<T = any>(url: ApiUrlInput, token?: string, enableRetry: boolean = false): Promise<T> {
  const fetchFn = async (): Promise<T> => {
    const normalizedUrl = normalizeApiUrl(url);
    return executeRequest<T>('DELETE', normalizedUrl, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
    });
  };

  return enableRetry ? withRetry(fetchFn) : fetchFn();
}
