import { describe, expect, it } from "vitest";
import { resolveApiUrl } from "./api-url";

describe("resolveApiUrl", () => {
  it("ưu tiên EXPO_PUBLIC_API_URL, bỏ gạch chéo cuối", () => {
    expect(resolveApiUrl("http://192.168.1.9:4000/", "10.0.0.2:8081")).toBe(
      "http://192.168.1.9:4000",
    );
  });

  it("không có biến môi trường thì lấy IP của Metro, cổng 4000", () => {
    expect(resolveApiUrl(undefined, "192.168.1.5:8081")).toBe("http://192.168.1.5:4000");
  });

  it("biến môi trường rỗng coi như không có", () => {
    expect(resolveApiUrl("  ", "192.168.1.5:8081")).toBe("http://192.168.1.5:4000");
  });

  it("không biết địa chỉ nào thì trả null", () => {
    expect(resolveApiUrl(undefined, undefined)).toBeNull();
  });
});
