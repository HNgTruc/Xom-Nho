import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { FilesService } from "./files.service.js";

/**
 * Việc chạy định kỳ của module files (`ScheduleModule` đăng ký ở `app.module.ts`).
 * Mỗi giờ dọn file tải lên mà không gắn bài quá 1 ngày. `waitForCompletion`: lần trước chưa xong thì bỏ qua lần này.
 */
@Injectable()
export class FilesScheduler {
  private readonly logger = new Logger(FilesScheduler.name);

  constructor(private readonly filesService: FilesService) {}

  @Cron(CronExpression.EVERY_HOUR, { name: "files-cleanup-orphans", waitForCompletion: true })
  async cleanupOrphans(): Promise<void> {
    try {
      await this.filesService.cleanupOrphans();
    } catch (error) {
      // Lỗi lần này (database bận...) thì ghi log, giờ sau thử lại
      this.logger.error(`Dọn file không gắn bài bị lỗi: ${String(error)}`);
    }
  }
}
