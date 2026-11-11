import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "../../config/config.service.js";

/** Khóa file trên đĩa: uuid + đuôi do backend chọn theo chữ ký nhị phân. Không chứa tên gốc hay dấu `/`. */
const STORAGE_KEY_PATTERN = /^[0-9a-f-]{36}\.(jpg|png|webp|mp4|webm)$/;

/**
 * Lưu file tải lên trên ổ đĩa của backend (ADR 0005). Mọi chỗ đọc ghi file đi qua lớp này; chuyển sang cloud
 * sau này chỉ cần viết lại nó. Không biết gì về quyền: service gọi nó đã kiểm tra trước.
 */
@Injectable()
export class StorageService {
  private readonly root: string;

  constructor(config: ConfigService) {
    const dir = config.get("UPLOAD_DIR");
    this.root = isAbsolute(dir) ? dir : resolve(process.cwd(), dir);
  }

  /** Ghi file mới, trả khóa để lưu vào database. */
  async save(data: Uint8Array, extension: string): Promise<string> {
    const key = `${randomUUID()}.${extension}`;
    await mkdir(this.root, { recursive: true });
    await writeFile(this.pathFor(key), data, { flag: "wx" });
    return key;
  }

  /** Đường dẫn tuyệt đối của file, để Express gửi kèm hỗ trợ Range (tua video). Khóa lạ thì ném lỗi. */
  pathFor(key: string): string {
    if (!STORAGE_KEY_PATTERN.test(key)) throw new Error(`Khóa file không hợp lệ: ${key}`);
    return resolve(this.root, key);
  }

  /** Xóa file; không có thì thôi. */
  async remove(key: string): Promise<void> {
    await rm(this.pathFor(key), { force: true });
  }
}
