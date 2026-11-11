import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ConfigService } from "../../config/config.service.js";
import { isStorageKey, StorageService } from "./storage.service.js";

const UUID = "22a4a706-1d4f-4dc2-b731-38f005cdf717";

describe("isStorageKey", () => {
  it.each([
    `images/${UUID}.png`,
    `images/${UUID}.webp`,
    `videos/${UUID}.mp4`,
    `avatars/${UUID}.jpg`,
  ])("nhận khóa đúng dạng: %s", (key) => {
    expect(isStorageKey(key)).toBe(true);
  });

  it.each([
    [`${UUID}.png`, "thiếu thư mục (dạng cũ)"],
    [`videos/${UUID}.png`, "ảnh trong thư mục video"],
    [`images/${UUID}.mp4`, "video trong thư mục ảnh"],
    [`docs/${UUID}.png`, "thư mục lạ"],
    [`images/../${UUID}.png`, "có .."],
    [`images\\${UUID}.png`, "dấu \\"],
    [`images/${UUID}.png.exe`, "đuôi lạ"],
    [`toString/${UUID}.png`, "tên thuộc tính của Object"],
  ])("chặn khóa %s (%s)", (key) => {
    expect(isStorageKey(key)).toBe(false);
  });
});

describe("StorageService", () => {
  let root: string;
  let storage: StorageService;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "xom-nho-storage-"));
    storage = new StorageService({ get: () => root } as unknown as ConfigService);
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("ghi file vào đúng thư mục con và trả khóa có tên thư mục", async () => {
    const key = await storage.save(new Uint8Array([1, 2, 3]), "png", "images");

    expect(key).toMatch(/^images\/[0-9a-f-]{36}\.png$/);
    expect(await readFile(join(root, key))).toEqual(Buffer.from([1, 2, 3]));
  });

  it("không ghi khi đuôi không hợp thư mục", async () => {
    await expect(storage.save(new Uint8Array([1]), "mp4", "images")).rejects.toThrow(
      "Khóa file không hợp lệ",
    );
    expect(existsSync(join(root, "images"))).toBe(false);
  });

  it("xóa file đã lưu, xóa lại lần nữa không lỗi", async () => {
    const key = await storage.save(new Uint8Array([1]), "webm", "videos");

    await storage.remove(key);
    await storage.remove(key);

    expect(existsSync(join(root, key))).toBe(false);
  });
});
