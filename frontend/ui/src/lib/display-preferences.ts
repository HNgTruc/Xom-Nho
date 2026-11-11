/**
 * Tùy chọn "Hiển thị và trợ năng" (MASTER mục 2.4, 5; docs/tinh-nang.md mục 1.6): chế độ tối, hiệu ứng kính,
 * giảm chuyển động. Lưu trên trình duyệt (localStorage), áp dụng bằng class `dark` và thuộc tính `data-*`
 * trên `<html>`; `theme.css` đọc các thuộc tính đó. Không biết nghiệp vụ nên web và admin dùng chung.
 */

export type ThemePreference = "system" | "light" | "dark";
/** `on`: luôn hiện kính, kể cả khi thiết bị báo giảm trong suốt. `off`: luôn dùng nền đặc. */
export type TransparencyPreference = "system" | "on" | "off";
export type MotionPreference = "system" | "reduce";

export interface DisplayPreferences {
  theme: ThemePreference;
  transparency: TransparencyPreference;
  motion: MotionPreference;
}

export const DEFAULT_DISPLAY_PREFERENCES: DisplayPreferences = {
  theme: "system",
  transparency: "system",
  motion: "system",
};

export const DISPLAY_PREFERENCES_KEY = "xom-nho:display";

/** Sự kiện báo đã đổi tùy chọn (trong cùng tab); tab khác nhận qua sự kiện `storage`. */
export const DISPLAY_PREFERENCES_EVENT = "xom-nho:display-change";

const THEMES: readonly ThemePreference[] = ["system", "light", "dark"];
const TRANSPARENCIES: readonly TransparencyPreference[] = ["system", "on", "off"];
const MOTIONS: readonly MotionPreference[] = ["system", "reduce"];

/** Dữ liệu lạ (người dùng sửa tay, phiên bản cũ) thì về mặc định từng trường, không báo lỗi. */
export function parseDisplayPreferences(raw: string | null): DisplayPreferences {
  let value: Partial<Record<keyof DisplayPreferences, unknown>> = {};
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (parsed && typeof parsed === "object") value = parsed;
  } catch {
    // giữ mặc định
  }
  const pick = <T extends string>(options: readonly T[], input: unknown, fallback: T): T =>
    options.includes(input as T) ? (input as T) : fallback;
  return {
    theme: pick(THEMES, value.theme, DEFAULT_DISPLAY_PREFERENCES.theme),
    transparency: pick(
      TRANSPARENCIES,
      value.transparency,
      DEFAULT_DISPLAY_PREFERENCES.transparency,
    ),
    motion: pick(MOTIONS, value.motion, DEFAULT_DISPLAY_PREFERENCES.motion),
  };
}

/** Đọc từ localStorage. Trình duyệt chặn bộ nhớ (chế độ riêng tư) thì dùng mặc định. */
export function readDisplayPreferences(): DisplayPreferences {
  try {
    return parseDisplayPreferences(window.localStorage.getItem(DISPLAY_PREFERENCES_KEY));
  } catch {
    return DEFAULT_DISPLAY_PREFERENCES;
  }
}

/** Gắn tùy chọn lên `<html>`: class `dark`, `color-scheme`, `data-transparency`, `data-motion`. */
export function applyDisplayPreferences(preferences: DisplayPreferences): void {
  const root = document.documentElement;
  const dark =
    preferences.theme === "dark" ||
    (preferences.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";

  if (preferences.transparency === "system") delete root.dataset.transparency;
  else root.dataset.transparency = preferences.transparency;

  if (preferences.motion === "system") delete root.dataset.motion;
  else root.dataset.motion = preferences.motion;
}

/** Lưu, áp dụng ngay, rồi báo cho các component đang hiển thị tùy chọn. */
export function saveDisplayPreferences(preferences: DisplayPreferences): void {
  try {
    window.localStorage.setItem(DISPLAY_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch {
    // không lưu được thì vẫn áp dụng cho lần xem này
  }
  applyDisplayPreferences(preferences);
  window.dispatchEvent(new Event(DISPLAY_PREFERENCES_EVENT));
}

/**
 * Chạy trong `<head>` trước khi trang vẽ, để không chớp sáng rồi mới tối. Phải tự đủ (không import gì),
 * vì được nhúng dạng chuỗi. Theo dõi chế độ tối của thiết bị khi người dùng chọn "Tự động".
 */
function initDisplayPreferences(key: string): void {
  const read = () => {
    try {
      const value = JSON.parse(window.localStorage.getItem(key) ?? "{}") as Record<string, unknown>;
      return value && typeof value === "object" ? value : {};
    } catch {
      return {};
    }
  };
  const apply = () => {
    const value = read();
    const root = document.documentElement;
    const theme = value.theme === "light" || value.theme === "dark" ? value.theme : "system";
    const dark =
      theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "light";
    if (value.transparency === "on" || value.transparency === "off") {
      root.dataset.transparency = value.transparency;
    }
    if (value.motion === "reduce") root.dataset.motion = "reduce";
  };
  apply();
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    const theme = read().theme;
    if (theme !== "light" && theme !== "dark") apply();
  });
}

/** Chuỗi script cho `<script>` trong `<head>` của app (nội dung cố định, không có dữ liệu người dùng). */
export const displayPreferencesScript = `(${initDisplayPreferences.toString()})(${JSON.stringify(
  DISPLAY_PREFERENCES_KEY,
)});`;
