import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service.js";

/** Số tạo mới của một ngày: `day` là `YYYY-MM-DD` đã dời theo múi giờ service truyền vào. */
export interface DayCountRow {
  day: string;
  count: number;
}

export interface DailyCounts {
  posts: DayCountRow[];
  comments: DayCountRow[];
  members: DayCountRow[];
}

/** Dòng `COUNT(*)` từ `$queryRaw`: driver trả `bigint`. */
type RawDayCount = { day: string; count: bigint | number };

function toRows(rows: RawDayCount[]): DayCountRow[] {
  return rows.map((row) => ({ day: row.day, count: Number(row.count) }));
}

/**
 * Truy vấn cho màn Tổng quan. Đếm thẳng trên bảng `post`, `comment`, `user` (chỉ đọc, chỉ đếm), không qua module
 * khác: đây là số liệu tổng hợp, không có quy tắc nghiệp vụ của bài hay bình luận.
 */
@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Số bài, bình luận, thành viên tạo từ `from` trở đi, gom theo ngày. `createdAt` lưu giờ UTC; cộng
   * `offsetMinutes` trước khi lấy ngày để ra ngày theo giờ địa phương. Ngày không có gì thì không có dòng.
   */
  async countDaily(from: Date, offsetMinutes: number): Promise<DailyCounts> {
    const [posts, comments, members] = await Promise.all([
      this.prisma.$queryRaw<RawDayCount[]>`
        SELECT DATE_FORMAT(DATE_ADD(createdAt, INTERVAL ${offsetMinutes} MINUTE), '%Y-%m-%d') AS day,
               COUNT(*) AS count
        FROM post WHERE createdAt >= ${from} GROUP BY day`,
      this.prisma.$queryRaw<RawDayCount[]>`
        SELECT DATE_FORMAT(DATE_ADD(createdAt, INTERVAL ${offsetMinutes} MINUTE), '%Y-%m-%d') AS day,
               COUNT(*) AS count
        FROM comment WHERE createdAt >= ${from} GROUP BY day`,
      this.prisma.$queryRaw<RawDayCount[]>`
        SELECT DATE_FORMAT(DATE_ADD(createdAt, INTERVAL ${offsetMinutes} MINUTE), '%Y-%m-%d') AS day,
               COUNT(*) AS count
        FROM \`user\` WHERE createdAt >= ${from} GROUP BY day`,
    ]);
    return { posts: toRows(posts), comments: toRows(comments), members: toRows(members) };
  }

  /** Đang ẩn, mọi lúc: bài `ARCHIVED`, bình luận `HIDDEN`. */
  async countHidden(): Promise<{ posts: number; comments: number }> {
    const [posts, comments] = await Promise.all([
      this.prisma.post.count({ where: { status: "ARCHIVED" } }),
      this.prisma.comment.count({ where: { status: "HIDDEN" } }),
    ]);
    return { posts, comments };
  }
}
