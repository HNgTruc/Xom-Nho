import { MEDIA_KINDS, type MediaKind, type MediaMimeType } from "@xom-nho/api";

export interface DetectedFileType {
  kind: MediaKind;
  mimeType: MediaMimeType;
  /** Đuôi file trên đĩa, do backend chọn (không lấy từ tên file người dùng gửi) */
  extension: "jpg" | "png" | "webp" | "mp4" | "webm";
}

const ascii = (bytes: Uint8Array, start: number, end: number) =>
  String.fromCharCode(...bytes.subarray(start, end));

const startsWith = (bytes: Uint8Array, signature: number[]) =>
  signature.every((byte, index) => bytes[index] === byte);

/**
 * "Brand" của MP4 mà trình duyệt phát được. Bỏ qua QuickTime (`qt  `) và HEIF/HEIC (`heic`, `mif1`...): cùng
 * khung `ftyp` nhưng không phải video MP4.
 */
const MP4_BRANDS = new Set([
  "isom",
  "iso2",
  "iso4",
  "iso5",
  "iso6",
  "mp41",
  "mp42",
  "avc1",
  "dash",
  "M4V ",
  "mmp4",
]);

/**
 * Nhận loại file bằng chữ ký nhị phân ở đầu file (ADR 0005), không tin đuôi file hay `Content-Type` do trình
 * duyệt gửi. Chỉ nhận ảnh JPG, PNG, WebP và video MP4, WebM; loại khác trả `null`.
 */
export function detectFileType(bytes: Uint8Array): DetectedFileType | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return { kind: MEDIA_KINDS.IMAGE, mimeType: "image/jpeg", extension: "jpg" };
  }
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { kind: MEDIA_KINDS.IMAGE, mimeType: "image/png", extension: "png" };
  }
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP") {
    return { kind: MEDIA_KINDS.IMAGE, mimeType: "image/webp", extension: "webp" };
  }
  if (bytes.length >= 12 && ascii(bytes, 4, 8) === "ftyp" && MP4_BRANDS.has(ascii(bytes, 8, 12))) {
    return { kind: MEDIA_KINDS.VIDEO, mimeType: "video/mp4", extension: "mp4" };
  }
  // WebM là Matroska (EBML) có DocType "webm" ngay trong phần đầu; Matroska khác (.mkv) không nhận
  if (
    startsWith(bytes, [0x1a, 0x45, 0xdf, 0xa3]) &&
    ascii(bytes, 0, Math.min(bytes.length, 64)).includes("webm")
  ) {
    return { kind: MEDIA_KINDS.VIDEO, mimeType: "video/webm", extension: "webm" };
  }
  return null;
}
