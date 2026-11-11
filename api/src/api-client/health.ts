import type { ApiResponse } from "../types/api-response.js";
import type { HealthStatus } from "../types/health.js";
import type { RequestFn } from "./client.js";

export function healthApi(request: RequestFn) {
  return {
    /** `GET /health`: backend còn sống không. */
    check: (signal?: AbortSignal) => request<ApiResponse<HealthStatus>>("/health", { signal }),
  };
}
