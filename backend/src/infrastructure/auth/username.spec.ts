import { generateUsername, toUsernameBase } from "./username.js";

describe("toUsernameBase", () => {
  it("lấy từ tên: bỏ dấu, đổi đ, bỏ khoảng trắng", () => {
    expect(toUsernameBase("Trần Thị Đào", "x@y.z")).toBe("tranthidao");
  });

  it("tên không có ký tự hợp lệ thì lấy phần trước @ của email", () => {
    expect(toUsernameBase("🙂🙂", "lan.anh-99@gmail.com")).toBe("lananh99");
  });

  it("không còn gì hợp lệ thì dùng hangxom", () => {
    expect(toUsernameBase("!!!", "@@")).toBe("hangxom");
  });

  it("cắt còn tối đa 20 ký tự", () => {
    expect(toUsernameBase("Nguyễn Hoàng Phương Thảo Nguyên", "a@b.c")).toHaveLength(20);
  });
});

describe("generateUsername", () => {
  it("dùng luôn phần gốc khi chưa ai lấy", async () => {
    await expect(generateUsername("lananh", async () => false)).resolves.toBe("lananh");
  });

  it("trùng thì thêm số tăng dần", async () => {
    const taken = new Set(["lananh", "lananh2"]);

    await expect(generateUsername("lananh", async (u) => taken.has(u))).resolves.toBe("lananh3");
  });

  it("thêm số mà vẫn không vượt 20 ký tự", async () => {
    const base = "a".repeat(20);

    const result = await generateUsername(base, async (u) => u === base);

    expect(result).toBe(`${"a".repeat(19)}2`);
  });
});
