import { API_PREFIX } from "../constants/api.js";
import { ERROR_CODES } from "../constants/error-codes.js";
import { ERROR_MESSAGES } from "../constants/messages.js";
import type { ApiErrorBody } from "../types/api-response.js";
import { ApiError } from "./api-error.js";

export interface ClientOptions {
  /** Gốc của backend, không kèm `/api/v1`. Ví dụ "http://localhost:4000". */
  baseUrl: string;
  /** Mặc định dùng `fetch` toàn cục. Truyền vào khi cần (test, Server Components chuyển tiếp cookie). */
  fetch?: typeof fetch;
  /** Header thêm vào mọi request, hoặc hàm trả header (đọc cookie của request hiện tại). */
  headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);
  /** Trình duyệt cần "include" để gửi cookie phiên sang backend khác origin. */
  credentials?: RequestCredentials;
}

export type QueryValue = string | number | boolean | null | undefined;

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  query?: Record<string, QueryValue>;
  body?: unknown;
  /** Gửi multipart (tải file). Không đặt `Content-Type`: `fetch` tự thêm kèm boundary. Dùng thay cho `body`. */
  formData?: FormData;
  signal?: AbortSignal;
}

/** Hàm gọi `/api/v1` cấp thấp; các file tài nguyên dựng trên nó. Trả nguyên phần thân `{ data, meta? }`. */
export type RequestFn = <T>(path: string, options?: RequestOptions) => Promise<T>;

export function buildUrl(
  baseUrl: string,
  path: string,
  query?: Record<string, QueryValue>,
): string {
  const url = `${baseUrl.replace(/\/+$/, "")}${API_PREFIX}${path}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const search = params.toString();
  return search ? `${url}?${search}` : url;
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as ApiErrorBody).error?.code === "string"
  );
}

export function createRequest(options: ClientOptions): RequestFn {
  const fetchFn = options.fetch ?? globalThis.fetch;

  return async function request<T>(path: string, init: RequestOptions = {}): Promise<T> {
    const extraHeaders =
      typeof options.headers === "function" ? await options.headers() : options.headers;
    const headers = new Headers(extraHeaders);
    headers.set("Accept", "application/json");
    if (init.body !== undefined && !init.formData) headers.set("Content-Type", "application/json");
    const requestBody =
      init.formData ?? (init.body === undefined ? undefined : JSON.stringify(init.body));

    let response: Response;
    try {
      response = await fetchFn(buildUrl(options.baseUrl, path, init.query), {
        method: init.method ?? "GET",
        headers,
        body: requestBody,
        credentials: options.credentials,
        signal: init.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") throw error;
      throw new ApiError(0, {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: ERROR_MESSAGES.INTERNAL_ERROR,
      });
    }

    if (response.status === 204) return undefined as T;

    const body: unknown = await response.json().catch(() => undefined);
    if (!response.ok) {
      if (isApiErrorBody(body)) throw new ApiError(response.status, body.error);
      throw new ApiError(response.status, {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: ERROR_MESSAGES.INTERNAL_ERROR,
      });
    }
    return body as T;
  };
}
