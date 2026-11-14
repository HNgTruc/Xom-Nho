import { useEffect, useState } from "react";

const DURATION_MS = 800;

/** Người dùng muốn bớt chuyển động: cài đặt thiết bị, hoặc `<html data-motion="reduce">` như web. */
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.dataset.motion === "reduce"
  );
}

/**
 * Số đếm từ 0 lên `target` trong khoảng 800ms, chậm dần (pages/admin.md "Thẻ số liệu"). Bớt chuyển động thì trả
 * ngay giá trị cuối. Chỉ đếm lần đầu có số; đổi số sau đó (bấm "Làm mới") thì hiện ngay, không đếm lại từ 0.
 */
export function useCountUp(target: number | undefined): number | undefined {
  const [started] = useState(() => !prefersReducedMotion());
  const [progress, setProgress] = useState(started ? 0 : 1);
  const ready = target !== undefined;

  useEffect(() => {
    if (!ready || !started) return;
    let frame = 0;
    let start: number | null = null;
    const step = (time: number) => {
      start ??= time;
      const t = Math.min(1, (time - start) / DURATION_MS);
      setProgress(t);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [ready, started]);

  if (target === undefined) return undefined;
  const eased = 1 - (1 - progress) ** 3;
  return Math.round(target * eased);
}
