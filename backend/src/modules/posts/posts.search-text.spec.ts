import { toSearchText } from "@xom-nho/shared";
import { buildPostSearchText } from "./posts.search-text.js";

describe("buildPostSearchText", () => {
  it("ghép tiêu đề, tóm tắt, tên tag rồi bỏ dấu, chữ thường", () => {
    expect(
      buildPostSearchText({
        title: "Bàn Tròn Cuối Tuần",
        excerpt: "Món ngon dễ nấu",
        tagNames: ["Đồ ăn", "Hà Nội"],
      }),
    ).toBe("ban tron cuoi tuan mon ngon de nau do an ha noi");
  });

  it("không có tag vẫn ra chuỗi gọn, không thừa khoảng trắng", () => {
    expect(buildPostSearchText({ title: "  Đi chợ ", excerpt: "", tagNames: [] })).toBe("di cho");
  });

  it("từ khóa người dùng gõ không dấu khớp với từng từ trong searchText", () => {
    const searchText = buildPostSearchText({
      title: "Đồ ăn đường phố",
      excerpt: "Để dành cuối tuần",
      tagNames: ["Ăn vặt"],
    });
    const words = searchText.split(" ");

    for (const keyword of ["do an", "de", "an vat"]) {
      for (const word of toSearchText(keyword).split(" ")) expect(words).toContain(word);
    }
  });
});
