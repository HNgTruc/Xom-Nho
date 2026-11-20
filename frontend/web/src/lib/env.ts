/**
 * Địa chỉ backend mà trình duyệt gọi (`NEXT_PUBLIC_API_URL`, công khai): api-client phía trình duyệt, Better Auth,
 * link ảnh, video. Server Components gọi backend qua `API_URL` riêng trong `server-api.ts`.
 */
export const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
