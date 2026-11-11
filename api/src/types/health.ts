/** Phản hồi của GET /api/v1/health (nằm trong `data`). */
export interface HealthStatus {
  status: "ok";
  /** Thời điểm server trả lời, ISO 8601. */
  timestamp: string;
}
