import { describe, expect, it } from "vitest";
import { guestAccess } from "./guest-access";

describe("guestAccess", () => {
  it("khách mở trang chủ thì thấy trang chào mừng, URL giữ nguyên", () => {
    expect(guestAccess("/", "", false)).toEqual({ kind: "rewrite", pathname: "/chao-mung" });
  });

  it.each(["/chao-mung", "/dang-nhap", "/dang-ky"])("khách mở %s được", (pathname) => {
    expect(guestAccess(pathname, "", false)).toEqual({ kind: "pass" });
  });

  it.each([
    ["/bai-viet/ban-tron", "", "/dang-nhap?next=%2Fbai-viet%2Fban-tron"],
    [
      "/danh-muc/doi-song",
      "?sort=top&page=2",
      "/dang-nhap?next=%2Fdanh-muc%2Fdoi-song%3Fsort%3Dtop%26page%3D2",
    ],
    ["/tag/an-vat", "", "/dang-nhap?next=%2Ftag%2Fan-vat"],
    ["/u/lananh", "", "/dang-nhap?next=%2Fu%2Flananh"],
    ["/cai-dat", "", "/dang-nhap?next=%2Fcai-dat"],
    ["/trang-chua-co", "", "/dang-nhap?next=%2Ftrang-chua-co"],
  ])("khách mở %s%s thì sang đăng nhập, xong quay lại", (pathname, search, href) => {
    expect(guestAccess(pathname, search, false)).toEqual({ kind: "redirect", href });
  });

  it.each(["/", "/bai-viet/ban-tron", "/cai-dat", "/dang-nhap"])(
    "có phiên thì mở %s bình thường",
    (pathname) => {
      expect(guestAccess(pathname, "", true)).toEqual({ kind: "pass" });
    },
  );

  it("có phiên mà mở trang chào mừng thì về trang chủ", () => {
    expect(guestAccess("/chao-mung", "", true)).toEqual({ kind: "redirect", href: "/" });
  });
});
