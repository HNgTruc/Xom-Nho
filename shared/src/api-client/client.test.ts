import { describe, expect, it, vi } from "vitest";
import { buildUrl } from "./client.js";
import { ApiError, createClient } from "./index.js";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("buildUrl", () => {
  it("ghép gốc, tiền tố /api/v1 và đường dẫn, bỏ gạch chéo thừa", () => {
    expect(buildUrl("http://localhost:4000/", "/categories")).toBe(
      "http://localhost:4000/api/v1/categories",
    );
  });

  it("bỏ tham số rỗng khỏi query", () => {
    expect(buildUrl("http://x", "/posts", { page: 2, tag: undefined, q: "", sort: "new" })).toBe(
      "http://x/api/v1/posts?page=2&sort=new",
    );
  });
});

describe("createClient", () => {
  it("trả nguyên phần thân khi thành công", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { data: [] }));
    const api = createClient({ baseUrl: "http://x", fetch: fetchMock });

    await expect(api.categories.list()).resolves.toEqual({ data: [] });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://x/api/v1/categories",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("gửi credentials và header cấu hình", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { data: {} }));
    const api = createClient({
      baseUrl: "http://x",
      fetch: fetchMock,
      credentials: "include",
      headers: () => ({ cookie: "phien=abc" }),
    });

    await api.health.check();
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init.credentials).toBe("include");
    expect(new Headers(init.headers).get("cookie")).toBe("phien=abc");
  });

  it("ném ApiError mang mã lỗi và lỗi từng trường từ backend", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(400, {
        error: {
          code: "VALIDATION_ERROR",
          message: "Tiêu đề quá ngắn",
          fields: { title: "Tối thiểu 5 ký tự" },
        },
      }),
    );
    const api = createClient({ baseUrl: "http://x", fetch: fetchMock });

    const error = await api.categories.list().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 400,
      code: "VALIDATION_ERROR",
      fields: { title: "Tối thiểu 5 ký tự" },
    });
  });

  it("đổi lỗi mạng thành ApiError INTERNAL_ERROR có câu tiếng Việt", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    const api = createClient({ baseUrl: "http://x", fetch: fetchMock });

    await expect(api.health.check()).rejects.toMatchObject({ status: 0, code: "INTERNAL_ERROR" });
  });
});
