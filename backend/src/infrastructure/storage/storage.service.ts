import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "../../config/config.service.js";

/** Thư mục con trong `UPLOAD_DIR`, mỗi thư mục chỉ nhận đúng các đuôi của nó. */
const FOLDER_EXTENSIONS = {
  images: ["jpg", "png", "webp"],
  videos: ["mp4", "webm"],
  avatars: ["jpg", "png", "webp"],
} as const satisfies Record<string, readonly string[]>;

export type StorageFolder = keyof typeof FOLDER_EXTENSIONS;

const KEY_SHAPE = /^([a-z]+)\/[0-9a-f-]{36}\.([a-z0-9]+)$/;

/**
 * Khóa file: `<thư mục>/<uuid>.<đuôi>`, đuôi do backend chọn theo chữ ký nhị phân và phải hợp với thư mục.
 * Không chứa tên gốc, `..` hay `\`, nên không thoát ra ngoài `UPLOAD_DIR` được.
 */
export function isStorageKey(key: string): boolean {
  const match = KEY_SHAPE.exec(key);
  if (!match) return false;
  const [, folder, extension] = match;
  if (!Object.hasOwn(FOLDER_EXTENSIONS, folder)) return false;
  return (FOLDER_EXTENSIONS[folder as StorageFolder] as readonly string[]).includes(extension);
}

/** Đường dẫn tuyệt đối của `UPLOAD_DIR`; đường dẫn tương đối tính từ thư mục chạy backend (`backend/`, cùng chỗ đọc `.env`). */
export function resolveUploadRoot(dir: string): string {
  return isAbsolute(dir) ? dir : resolve(process.cwd(), dir);
}

/**
 * Lưu file tải lên trên ổ đĩa (ADR 0005), mặc định ở `media/` gốc repo, chia `images/`, `videos/`, `avatars/`.
 * Mọi chỗ đọc ghi file đi qua lớp này; chuyển sang cloud sau này chỉ cần viết lại nó.
 * Không biết gì về quyền: service gọi nó đã kiểm tra trước.
 */
@Injectable()
export class StorageService {
  private readonly root: string;

  constructor(config: ConfigService) {
    this.root = resolveUploadRoot(config.get("UPLOAD_DIR"));
  }

  /** Ghi file mới vào thư mục con, trả khóa để lưu vào database. Đuôi không hợp thư mục thì ném lỗi. */
  async save(data: Uint8Array, extension: string, folder: StorageFolder): Promise<string> {
    const key = `${folder}/${randomUUID()}.${extension}`;
    const path = this.pathFor(key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, data, { flag: "wx" });
    return key;
  }

  /** Đường dẫn tuyệt đối của file, để Express gửi kèm hỗ trợ Range (tua video). Khóa lạ thì ném lỗi. */
  pathFor(key: string): string {
    if (!isStorageKey(key)) throw new Error(`Khóa file không hợp lệ: ${key}`);
    return resolve(this.root, key);
  }

  /** Xóa file; không có thì thôi. */
  async remove(key: string): Promise<void> {
    await rm(this.pathFor(key), { force: true });
  }
}
