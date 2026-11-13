import { expect, test } from "@playwright/test";
import {
  COMMENT_MESSAGES,
  COMPOSER_MESSAGES,
  composerPrompt,
  DISLIKE_MESSAGES,
  dislikeCountLabel,
  LIKE_MESSAGES,
  likeCountLabel,
} from "@xom-nho/api";

/**
 * Luồng chính của web (docs/lo-trinh.md giai đoạn 4): đăng ký → viết bài → bình luận → Thích, Không thích.
 * Mỗi lần chạy dùng tài khoản và bài mới (tên có hậu tố ngẫu nhiên) nên không cần dọn database test.
 */
test("hàng xóm mới đăng ký, đăng bài rồi bình luận vào bài của mình", async ({ page }) => {
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const name = `Hàng Xóm ${suffix}`;
  const title = `Chào cả xóm ${suffix}`;
  const content = "Mình mới dọn tới đầu hẻm, ai rảnh ghé uống trà nha.";
  const comment = `Cảm ơn cả nhà đã đọc ${suffix}`;

  await test.step("đăng ký bằng email thì về trang chủ, thấy lời mời viết bài", async () => {
    await page.goto("/dang-ky");
    await page.getByLabel("Tên hiển thị").fill(name);
    await page.getByLabel("Email").fill(`e2e-${suffix}@xomnho.test`);
    await page.getByLabel("Mật khẩu", { exact: true }).fill("matkhau-e2e-123");
    await page.getByRole("button", { name: "Đăng ký", exact: true }).click();

    // Better Auth băm mật khẩu bằng scrypt (tốn CPU): chạy song song nhiều lượt trên máy yếu có thể quá 5 giây
    await expect(page).toHaveURL("/", { timeout: 15_000 });
    await expect(page.getByRole("button", { name: composerPrompt(name) })).toBeVisible();
  });

  await test.step("đăng bài từ ô tạo bài thì bài hiện ngay trên trang chủ", async () => {
    const dialog = page.getByRole("dialog", { name: COMPOSER_MESSAGES.DIALOG_TITLE });
    // Nút chỉ mở hộp khi trang đã hydrate xong: bấm lại tới khi hộp hiện
    await expect(async () => {
      await page.getByRole("button", { name: composerPrompt(name) }).click();
      await expect(dialog).toBeVisible({ timeout: 1_000 });
    }).toPass();

    await dialog.getByLabel(COMPOSER_MESSAGES.TITLE_PLACEHOLDER).fill(title);
    await dialog.getByLabel(COMPOSER_MESSAGES.CONTENT_LABEL).fill(content);
    await dialog.getByRole("button", { name: COMPOSER_MESSAGES.SUBMIT }).click();

    await expect(dialog).toBeHidden();
    await expect(page.getByText(COMPOSER_MESSAGES.PUBLISHED)).toBeVisible();
    await expect(page.getByRole("link", { name: title })).toBeVisible();
  });

  await test.step("mở bài thì thấy nội dung, chưa có bình luận", async () => {
    await page.getByRole("link", { name: title }).click();

    await expect(page).toHaveURL(/\/bai-viet\//);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    // Cột bên cạnh có danh sách bài cùng đoạn trích: chỉ tìm trong phần thân bài
    await expect(page.getByRole("article").getByText(content)).toBeVisible();
    await expect(page.getByText(COMMENT_MESSAGES.NONE_YET)).toBeVisible();
  });

  await test.step("gửi bình luận thì bình luận hiện dưới bài, tải lại vẫn còn", async () => {
    await page.getByLabel(COMMENT_MESSAGES.FORM_LABEL).fill(comment);
    await page.getByRole("button", { name: COMMENT_MESSAGES.SUBMIT }).click();

    await expect(page.getByText(comment)).toBeVisible();
    await expect(page.getByText(COMMENT_MESSAGES.NONE_YET)).toBeHidden();

    await page.reload();
    await expect(page.getByText(comment)).toBeVisible();
  });

  await test.step("Thích và Không thích loại trừ nhau, tải lại vẫn giữ lựa chọn (ADR 0009)", async () => {
    const like = page.getByRole("button", { name: LIKE_MESSAGES.LIKE, exact: true });
    const dislike = page.getByRole("button", { name: DISLIKE_MESSAGES.DISLIKE });
    // Nút đổi ngay khi bấm (lạc quan); chờ server lưu xong rồi mới tải lại, không thì đọc trúng lúc đang ghi
    const saved = (kind: "like" | "dislike") =>
      page.waitForResponse((r) => r.url().endsWith(`/${kind}`) && r.request().method() === "PUT");

    // Bấm liền hai nút, không chờ: các lượt bấm phải được lưu đúng thứ tự bấm
    const bothSaved = Promise.all([saved("dislike"), saved("like")]);
    await dislike.click();
    await expect(dislike).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText(dislikeCountLabel(1))).toBeAttached();

    await like.click();
    await expect(like).toHaveAttribute("aria-pressed", "true");
    await expect(dislike).toHaveAttribute("aria-pressed", "false");
    await bothSaved;

    await page.reload();
    await expect(like).toHaveAttribute("aria-pressed", "true");
    await expect(dislike).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByText(likeCountLabel(1))).toBeAttached();
  });
});
