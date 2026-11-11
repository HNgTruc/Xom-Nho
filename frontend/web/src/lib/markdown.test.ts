import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./markdown";

const html = (content: string) => renderToStaticMarkup(renderMarkdown(content).element);

describe("renderMarkdown: chặn mã độc", () => {
  it("thẻ <script> bị bỏ, không thành thẻ, chữ xung quanh vẫn còn", () => {
    const out = html("Xin chào <script>alert(1)</script>");

    expect(out).not.toContain("<script");
    expect(out).toContain("Xin chào");
  });

  it("<img onerror> bị bỏ, không có thuộc tính onerror", () => {
    const out = html('<img src="x" onerror="alert(1)">');

    expect(out).not.toMatch(/<img[^>]*onerror/i);
  });

  it.each([
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    "data:text/html,<script>alert(1)</script>",
  ])("liên kết %s thành chữ thường, không có href", (url) => {
    const out = html(`[bấm vào đây](${url})`);

    expect(out).not.toMatch(/href=/i);
    expect(out).toContain("bấm vào đây");
  });

  it("ảnh có src javascript: thì bỏ hẳn", () => {
    expect(html("![ảnh](javascript:alert(1))")).not.toContain("<img");
  });

  it("thuộc tính lạ trong HTML bài viết không lọt ra (style, on*)", () => {
    const out = html('<a href="https://x.vn" style="position:fixed" onclick="alert(1)">x</a>');

    expect(out).not.toMatch(/style=|onclick=/i);
  });
});

describe("renderMarkdown: liên kết", () => {
  it("liên kết ra ngoài có rel nofollow ugc noopener, mở tab mới, báo cho trình đọc màn hình", () => {
    const out = html("[Báo](https://vnexpress.net)");

    expect(out).toContain('rel="nofollow ugc noopener"');
    expect(out).toContain('target="_blank"');
    expect(out).toContain("(mở trong tab mới)");
  });

  it("liên kết trong trang không có rel, không mở tab mới", () => {
    const out = html("[Bài khác](/bai-viet/ban-tron)");

    expect(out).toContain('href="/bai-viet/ban-tron"');
    expect(out).not.toContain("nofollow");
    expect(out).not.toContain("_blank");
  });

  it("ảnh ngoài không gửi referrer, tải chậm", () => {
    const out = html("![Mèo](https://anh.vn/meo.jpg)");

    expect(out).toContain('referrerPolicy="no-referrer"');
    expect(out).toContain('loading="lazy"');
    expect(out).toContain('alt="Mèo"');
  });
});

describe("renderMarkdown: tiêu đề và mục lục", () => {
  it("tiêu đề có id, mục lục lấy đúng id đó, có dấu tiếng Việt", () => {
    const { element, toc } = renderMarkdown("## Món ăn ngon\n\n### Cách nấu\n\n## Món ăn ngon");
    const out = renderToStaticMarkup(element);

    expect(toc.map((item) => item.depth)).toEqual([2, 3, 2]);
    for (const item of toc) expect(out).toContain(`id="${item.id}"`);
    // Tiêu đề trùng tên vẫn có id khác nhau
    expect(new Set(toc.map((item) => item.id)).size).toBe(3);
  });

  it("# trong bài thành h2 (trang đã có h1 là tiêu đề bài)", () => {
    const { element, toc } = renderMarkdown("# Mở đầu");

    expect(renderToStaticMarkup(element)).toMatch(/^<h2/);
    expect(toc).toEqual([{ id: expect.any(String), text: "Mở đầu", depth: 2 }]);
  });

  it("mục lục lấy chữ thuần của tiêu đề có định dạng", () => {
    const { toc } = renderMarkdown("## Đi **chợ** sáng");

    expect(toc[0]?.text).toBe("Đi chợ sáng");
  });
});

describe("renderMarkdown: GFM", () => {
  it("bảng nằm trong khung cuộn ngang riêng", () => {
    const out = html("| a | b |\n| - | - |\n| 1 | 2 |");

    expect(out).toContain('<div class="my-6 overflow-x-auto"><table');
  });

  it("danh sách việc có ô đánh dấu không bấm được", () => {
    const out = html("- [x] Mua rau\n- [ ] Nấu cơm");

    expect(out).toMatch(/<input[^>]*type="checkbox"[^>]*disabled/);
  });
});
