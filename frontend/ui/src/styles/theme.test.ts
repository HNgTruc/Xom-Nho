import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { categoryColors, colors, statusColors } from "../tokens";

const css = readFileSync(new URL("./theme.css", import.meta.url), "utf8");

/** Lấy các biến `--ten: giá-trị;` trong khối `selector { ... }` (khối không lồng nhau). */
function readVars(selector: string): Map<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`Không thấy khối ${selector} trong theme.css`);
  const block = css.slice(start, css.indexOf("}", start));
  const vars = new Map<string, string>();
  for (const [, name, value] of block.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    if (name && value) vars.set(name, value.trim().toLowerCase());
  }
  return vars;
}

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

describe.each([
  ["light", ":root"],
  ["dark", ".dark"],
] as const)("theme.css khớp tokens ở chế độ %s", (scheme, selector) => {
  const vars = readVars(selector);

  it.each(Object.entries(colors[scheme]))("màu nền tảng %s", (name, value) => {
    expect(vars.get(kebab(name))).toBe(value.toLowerCase());
  });

  it.each(Object.entries(categoryColors))("màu danh mục %s", (name, tones) => {
    expect(vars.get(`category-${name}`)).toBe(tones[scheme].fg.toLowerCase());
    expect(vars.get(`category-${name}-bg`)).toBe(tones[scheme].bg.toLowerCase());
  });

  it.each(Object.entries(statusColors))("màu trạng thái %s", (name, tones) => {
    expect(vars.get(`status-${name}`)).toBe(tones[scheme].fg.toLowerCase());
    expect(vars.get(`status-${name}-bg`)).toBe(tones[scheme].bg.toLowerCase());
  });
});
