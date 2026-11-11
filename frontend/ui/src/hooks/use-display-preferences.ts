"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  DEFAULT_DISPLAY_PREFERENCES,
  DISPLAY_PREFERENCES_EVENT,
  DISPLAY_PREFERENCES_KEY,
  type DisplayPreferences,
  parseDisplayPreferences,
  saveDisplayPreferences,
} from "../lib/display-preferences";

function subscribe(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === DISPLAY_PREFERENCES_KEY) onChange();
  };
  window.addEventListener(DISPLAY_PREFERENCES_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(DISPLAY_PREFERENCES_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

// useSyncExternalStore cần cùng một object khi dữ liệu không đổi: nhớ theo chuỗi gốc
let cachedRaw: string | null | undefined;
let cachedValue: DisplayPreferences = DEFAULT_DISPLAY_PREFERENCES;

function getSnapshot(): DisplayPreferences {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(DISPLAY_PREFERENCES_KEY);
  } catch {
    // bộ nhớ bị chặn: dùng mặc định
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = parseDisplayPreferences(raw);
  }
  return cachedValue;
}

const getServerSnapshot = () => DEFAULT_DISPLAY_PREFERENCES;

/** Tùy chọn hiển thị hiện tại và hàm đổi từng mục; mọi component dùng hook này cùng cập nhật, kể cả tab khác. */
export function useDisplayPreferences() {
  const preferences = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const update = useCallback(
    (patch: Partial<DisplayPreferences>) => saveDisplayPreferences({ ...getSnapshot(), ...patch }),
    [],
  );
  return { preferences, update };
}
