import { connection } from "next/server";

/**
 * Thời điểm của request hiện tại, để tính "2 giờ trước". `connection()` báo cho Next đây là giá trị lúc có
 * request (không đưa vào phần dựng sẵn), nên component gọi hàm này phải nằm trong `<Suspense>`.
 */
export async function requestTime(): Promise<Date> {
  await connection();
  return new Date();
}
