const BACKEND_PORT = 4000;

/**
 * Gốc của backend cho app.
 * - Có `EXPO_PUBLIC_API_URL` thì dùng nó.
 * - Không có thì lấy IP của máy đang chạy Metro (`hostUri`, ví dụ "192.168.1.5:8081"), đổi sang cổng 4000:
 *   điện thoại cùng Wi-Fi gọi được backend mà không cần tự điền IP.
 * Điện thoại không gọi được "localhost" của máy tính, nên không bao giờ rơi về localhost.
 */
export function resolveApiUrl(
  envUrl: string | undefined,
  hostUri: string | undefined,
): string | null {
  if (envUrl?.trim()) return envUrl.trim().replace(/\/+$/, "");

  const host = hostUri?.split(":")[0];
  if (!host) return null;
  return `http://${host}:${BACKEND_PORT}`;
}
