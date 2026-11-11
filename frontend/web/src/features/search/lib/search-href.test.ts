import { describe, expect, it } from "vitest";
import { searchHref } from "./search-href";

describe("searchHref", () => {
  it("chỉ có từ khóa", () => {
    expect(searchHref({ q: "bàn tròn" })).toBe("/tim-kiem?q=b%C3%A0n+tr%C3%B2n");
  });

  it("cắt khoảng trắng thừa ở hai đầu", () => {
    expect(searchHref({ q: "  do an  " })).toBe("/tim-kiem?q=do+an");
  });

  it("từ khóa rỗng hoặc chỉ có khoảng trắng thì không có q", () => {
    expect(searchHref({ q: "" })).toBe("/tim-kiem");
    expect(searchHref({ q: "   " })).toBe("/tim-kiem");
  });

  it("kèm danh mục và trang, bỏ trang 1", () => {
    expect(searchHref({ q: "do an", category: "doi-song", page: 2 })).toBe(
      "/tim-kiem?q=do+an&category=doi-song&page=2",
    );
    expect(searchHref({ q: "do an", category: "doi-song", page: 1 })).toBe(
      "/tim-kiem?q=do+an&category=doi-song",
    );
  });

  it("mã hóa ký tự đặc biệt trong từ khóa", () => {
    expect(searchHref({ q: "a&b=c#d" })).toBe("/tim-kiem?q=a%26b%3Dc%23d");
  });
});
