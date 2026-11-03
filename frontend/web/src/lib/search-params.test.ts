import { listPostsQuerySchema } from "@xom-nho/shared";
import { describe, expect, it } from "vitest";
import { parseSearchParams } from "./search-params";

describe("parseSearchParams", () => {
  it("query đúng thì giữ nguyên", () => {
    expect(parseSearchParams(listPostsQuerySchema, { sort: "top", page: "2" })).toEqual({
      page: 2,
      pageSize: 10,
      sort: "top",
    });
  });

  it("trường sai thì về mặc định, trường đúng vẫn giữ", () => {
    expect(parseSearchParams(listPostsQuerySchema, { sort: "top", page: "abc" })).toEqual({
      page: 1,
      pageSize: 10,
      sort: "top",
    });
  });

  it("mọi trường đều sai thì ra toàn mặc định", () => {
    expect(parseSearchParams(listPostsQuerySchema, { sort: "random", page: "-1" })).toEqual({
      page: 1,
      pageSize: 10,
      sort: "new",
    });
  });

  it("giá trị lặp thì lấy giá trị đầu", () => {
    expect(parseSearchParams(listPostsQuerySchema, { sort: ["top", "new"] })).toMatchObject({
      sort: "top",
    });
  });
});
