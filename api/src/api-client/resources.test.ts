import { describe, expect, it, vi } from "vitest";
import { createClient } from "./index.js";

function setup(body: unknown = { data: [] }, status = 200) {
  const fetchMock = vi.fn().mockImplementation(() =>
    Promise.resolve(
      status === 204
        ? new Response(null, { status })
        : new Response(JSON.stringify(body), {
            status,
            headers: { "Content-Type": "application/json" },
          }),
    ),
  );
  const api = createClient({ baseUrl: "http://x", fetch: fetchMock });
  const calledUrl = () => fetchMock.mock.calls[0]?.[0] as string;
  const calledInit = () => fetchMock.mock.calls[0]?.[1] as RequestInit;
  return { api, fetchMock, calledUrl, calledInit };
}

describe("api.posts", () => {
  it("list gửi bộ lọc lên query, bỏ bộ lọc rỗng", async () => {
    const { api, calledUrl } = setup();

    await api.posts.list({ page: 2, sort: "top", category: "doi-song", tag: undefined });

    expect(calledUrl()).toBe("http://x/api/v1/posts?page=2&sort=top&category=doi-song");
  });

  it("get mã hóa slug trong đường dẫn", async () => {
    const { api, calledUrl } = setup({ data: {} });

    await api.posts.get("ban tron/../x");

    expect(calledUrl()).toBe("http://x/api/v1/posts/ban%20tron%2F..%2Fx");
  });

  it("view gọi POST và chấp nhận 204 không có thân", async () => {
    const { api, calledUrl, calledInit } = setup(undefined, 204);

    await expect(api.posts.view("p1")).resolves.toBeUndefined();
    expect(calledUrl()).toBe("http://x/api/v1/posts/p1/view");
    expect(calledInit().method).toBe("POST");
  });
});

describe("api.posts.create và api.files", () => {
  it("create gửi JSON bằng POST", async () => {
    const { api, calledUrl, calledInit } = setup({ data: {} });
    const input = { title: "", content: "Chào", category: "doi-song", mediaIds: ["m1"] };

    await api.posts.create(input);

    expect(calledUrl()).toBe("http://x/api/v1/posts");
    expect(calledInit().method).toBe("POST");
    expect(JSON.parse(calledInit().body as string)).toEqual(input);
    expect(new Headers(calledInit().headers).get("Content-Type")).toBe("application/json");
  });

  it("upload gửi multipart trường file, không tự đặt Content-Type", async () => {
    const { api, calledUrl, calledInit } = setup({ data: {} });

    await api.files.upload(new Blob(["abc"], { type: "image/png" }), "anh.png");

    expect(calledUrl()).toBe("http://x/api/v1/files");
    expect(calledInit().method).toBe("POST");
    const body = calledInit().body as FormData;
    expect(body).toBeInstanceOf(FormData);
    expect((body.get("file") as File).name).toBe("anh.png");
    expect(new Headers(calledInit().headers).has("Content-Type")).toBe(false);
  });

  it("fileUrl ghép đúng đường dẫn, mã hóa id", async () => {
    const { fileUrl } = await import("./index.js");
    expect(fileUrl("http://x/", "a b")).toBe("http://x/api/v1/files/a%20b");
  });
});

describe("api.search", () => {
  it.each(["", "   "])("từ khóa %j trả trang rỗng, không gọi backend", async (q) => {
    const { api, fetchMock } = setup();

    await expect(api.search.posts({ q })).resolves.toEqual({
      data: [],
      meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("có từ khóa thì gọi /search với từ khóa đã cắt khoảng trắng", async () => {
    const { api, calledUrl } = setup({ data: [], meta: {} });

    await api.search.posts({ q: "  đồ ăn ", category: "am-thuc", page: 2 });

    const url = new URL(calledUrl());
    expect(url.pathname).toBe("/api/v1/search");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      q: "đồ ăn",
      category: "am-thuc",
      page: "2",
    });
  });
});

describe("api.tags, api.users", () => {
  it("tags.suggest gửi q", async () => {
    const { api, calledUrl } = setup();

    await api.tags.suggest("an vat");

    expect(calledUrl()).toBe("http://x/api/v1/tags?q=an+vat");
  });

  it("tags.get và users.get dựng đúng đường dẫn", async () => {
    const tags = setup({ data: {} });
    await tags.api.tags.get("an-vat");
    expect(tags.calledUrl()).toBe("http://x/api/v1/tags/an-vat");

    const users = setup({ data: {} });
    await users.api.users.get("lananh");
    expect(users.calledUrl()).toBe("http://x/api/v1/users/lananh");
  });
});
