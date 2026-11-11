import { detectFileType } from "./file-signature.js";

const bytes = (...parts: (number[] | string)[]) =>
  new Uint8Array(
    parts.flatMap((part) =>
      typeof part === "string" ? [...new TextEncoder().encode(part)] : part,
    ),
  );

describe("detectFileType", () => {
  it.each([
    ["JPG", bytes([0xff, 0xd8, 0xff, 0xe0], "JFIF"), "image/jpeg", "jpg"],
    ["PNG", bytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], "IHDR"), "image/png", "png"],
    ["WebP", bytes("RIFF", [0, 0, 0, 0], "WEBPVP8 "), "image/webp", "webp"],
    ["MP4 isom", bytes([0, 0, 0, 0x20], "ftypisom", [0, 0, 2, 0]), "video/mp4", "mp4"],
    ["MP4 mp42", bytes([0, 0, 0, 0x18], "ftypmp42", [0, 0, 0, 0]), "video/mp4", "mp4"],
    [
      "WebM",
      bytes([0x1a, 0x45, 0xdf, 0xa3, 0x9f, 0x42, 0x82, 0x84], "webm", [0x42, 0x87]),
      "video/webm",
      "webm",
    ],
  ])("nhận %s", (_name, data, mimeType, extension) => {
    expect(detectFileType(data)).toMatchObject({ mimeType, extension });
  });

  it.each([
    ["file rỗng", bytes()],
    ["chữ thường đổi đuôi thành .jpg", bytes("hello world, toi la file text")],
    ["GIF", bytes("GIF89a", [1, 0, 1, 0])],
    ["SVG (có thể chứa script)", bytes('<svg xmlns="http://www.w3.org/2000/svg">')],
    ["HTML", bytes("<!doctype html><script>")],
    ["PDF", bytes("%PDF-1.7")],
    ["HEIC", bytes([0, 0, 0, 0x18], "ftypheic", [0, 0, 0, 0])],
    ["MOV QuickTime", bytes([0, 0, 0, 0x14], "ftypqt  ", [0, 0, 0, 0])],
    [
      "MKV (Matroska không phải WebM)",
      bytes([0x1a, 0x45, 0xdf, 0xa3, 0x9f, 0x42, 0x82, 0x88], "matroska"),
    ],
    ["RIFF nhưng là WAV", bytes("RIFF", [0, 0, 0, 0], "WAVEfmt ")],
  ])("từ chối %s", (_name, data) => {
    expect(detectFileType(data)).toBeNull();
  });
});
