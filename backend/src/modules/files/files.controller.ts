import { Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { FILE_MESSAGES, LIMITS, type MediaItem } from "@xom-nho/api";
import type { Response } from "express";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { AppException } from "../../common/exceptions/app-exception.js";
import type { SessionUser } from "../../common/types/session-user.js";
import { FilesService, type UploadedFileData } from "./files.service.js";

@Controller("files")
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /**
   * Tải một ảnh hoặc video lên, multipart trường `file`. Multer giữ trong bộ nhớ, chặn từ 25 MB (cỡ video tối
   * đa; ảnh 5 MB do service kiểm tra sau khi biết loại). Quá cỡ: 413.
   */
  @Post()
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: LIMITS.VIDEO_MAX_BYTES, files: 1, fields: 0 } }),
  )
  upload(
    @CurrentUser() user: SessionUser,
    @UploadedFile() file: UploadedFileData | undefined,
  ): Promise<MediaItem> {
    return this.filesService.upload(user, file);
  }

  /**
   * Gửi file. Express `sendFile` lo `Range` (tua video), `ETag`, `Last-Modified`. Cache riêng của trình
   * duyệt (file không đổi theo id), không cho CDN dùng chung vì quyền tùy người xem.
   */
  @Get(":id")
  async download(
    @CurrentUser() user: SessionUser,
    @Param("id") id: string,
    @Res() res: Response,
  ): Promise<void> {
    const file = await this.filesService.open(user, id);
    res.setHeader("Cache-Control", "private, max-age=604800, immutable");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Disposition", "inline");
    await new Promise<void>((resolve, reject) => {
      res.sendFile(file.path, { headers: { "Content-Type": file.mimeType } }, (error) => {
        if (!error || res.headersSent) return resolve();
        // Có dòng trong database mà mất file trên đĩa: coi như không có
        const missing = (error as NodeJS.ErrnoException).code === "ENOENT";
        reject(missing ? new AppException("NOT_FOUND", FILE_MESSAGES.NOT_FOUND) : error);
      });
    });
  }
}
