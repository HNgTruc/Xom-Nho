/**
 * Dữ liệu mẫu cho máy dev: `pnpm --filter backend db:seed`. Chạy lại nhiều lần được (upsert theo khóa duy nhất).
 * Mọi tài khoản mẫu đăng nhập bằng `<username>@xomnho.local` / SEED_PASSWORD (chỉ dùng ở máy dev).
 */
import { slugify } from "@xom-nho/shared";
import { hashPassword } from "better-auth/crypto";
import { loadEnv } from "../src/config/load-env.js";
import { type PostStatus } from "../src/generated/prisma/client.js";
import { createPrismaClient } from "../src/infrastructure/database/create-prisma-client.js";
import { buildPostSearchText } from "../src/modules/posts/posts.search-text.js";

const env = loadEnv();
if (env.NODE_ENV === "production") throw new Error("Không chạy seed trên production.");

const prisma = createPrismaClient(env.DATABASE_URL);

const SEED_PASSWORD = "xomnho123";

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

const users = [
  { id: "seed-admin", name: "Trưởng Xóm", username: "truongxom", role: "admin" },
  { id: "seed-author-1", name: "Lan Anh", username: "lananh", role: "author" },
  { id: "seed-author-2", name: "Minh Khoa", username: "minhkhoa", role: "author" },
  { id: "seed-user-1", name: "Bảo Ngọc", username: "baongoc", role: "user" },
  { id: "seed-user-2", name: "Quốc Huy", username: "quochuy", role: "user" },
  { id: "seed-user-3", name: "Thu Trang", username: "thutrang", role: "user" },
] as const;

const categories = [
  { name: "Đời sống", description: "Chuyện thường ngày trong xóm", color: "amber" },
  { name: "Công nghệ", description: "Máy móc, phần mềm, mẹo vặt", color: "blue" },
  { name: "Học tập", description: "Kinh nghiệm học, sách hay", color: "green" },
  { name: "Góc kể chuyện", description: "Truyện ngắn, tản văn, kỷ niệm", color: "purple" },
  { name: "Hỏi đáp", description: "Thắc mắc gì cứ hỏi hàng xóm", color: "rose" },
];

const tags = [
  "nấu ăn",
  "du lịch",
  "sức khỏe",
  "gia đình",
  "lập trình",
  "điện thoại",
  "máy tính",
  "tiếng anh",
  "sách",
  "kỷ niệm",
  "tuổi thơ",
  "mẹo vặt",
  "đồ ăn",
  "hà nội",
  "sài gòn",
];

// [tiêu đề, danh mục (chỉ số), tag (chỉ số), trạng thái]
const posts: [string, number, number[], PostStatus][] = [
  ["Bàn tròn cuối tuần: món ngon dễ nấu", 0, [0, 12], "PUBLISHED"],
  ["Đồ ăn đường phố Hà Nội mùa đông", 0, [12, 13], "PUBLISHED"],
  ["Một ngày rong ruổi Sài Gòn", 0, [1, 14], "PUBLISHED"],
  ["Giữ sức khỏe khi làm việc tại nhà", 0, [2, 11], "PUBLISHED"],
  ["Bữa cơm gia đình ngày mưa", 0, [3, 0], "PUBLISHED"],
  ["Mẹo dọn nhà nhanh trong 15 phút", 0, [11], "PENDING"],
  ["Học lập trình từ con số không", 1, [4], "PUBLISHED"],
  ["Chọn điện thoại cũ sao cho khỏi hớ", 1, [5, 11], "PUBLISHED"],
  ["Lắp máy tính đầu tiên của mình", 1, [6], "PUBLISHED"],
  ["Viết web đầu tiên bằng Next.js", 1, [4, 6], "PUBLISHED"],
  ["Sao lưu ảnh điện thoại cho bố mẹ", 1, [5, 3], "DRAFT"],
  ["Tự học tiếng Anh mỗi ngày 20 phút", 2, [7], "PUBLISHED"],
  ["Năm cuốn sách đổi cách mình nghĩ", 2, [8], "PUBLISHED"],
  ["Ghi chép thế nào để nhớ lâu", 2, [8, 11], "PUBLISHED"],
  ["Ôn thi không thức khuya", 2, [2], "REJECTED"],
  ["Đọc sách tiếng Anh cho người mới", 2, [7, 8], "PENDING"],
  ["Mùa hè năm ấy ở quê ngoại", 3, [9, 10], "PUBLISHED"],
  ["Chiếc xe đạp cũ của ba", 3, [9, 3], "PUBLISHED"],
  ["Tiếng rao đêm trong hẻm nhỏ", 3, [14, 9], "PUBLISHED"],
  ["Trò chơi tuổi thơ giờ còn ai nhớ", 3, [10], "PUBLISHED"],
  ["Lá thư chưa gửi", 3, [9], "DRAFT"],
  ["Cây hoa sữa đầu ngõ", 3, [13, 9], "ARCHIVED"],
  ["Nên mua laptop nào để học lập trình?", 4, [6, 4], "PUBLISHED"],
  ["Ăn gì ở Sài Gòn khi chỉ có một ngày?", 4, [12, 14], "PUBLISHED"],
  ["Làm sao để ngủ sớm hơn?", 4, [2], "PUBLISHED"],
  ["Có nên học tiếng Anh qua phim?", 4, [7], "PUBLISHED"],
  ["Gửi đồ ăn từ Hà Nội vào Sài Gòn thế nào?", 4, [12, 13, 14], "PENDING"],
  ["Điện thoại nóng máy phải làm sao?", 4, [5], "REJECTED"],
  ["Đi du lịch một mình có an toàn không?", 4, [1], "DRAFT"],
  ["Cách dạy con tự lập từ nhỏ", 0, [3], "ARCHIVED"],
];

const commentPool = [
  "Đọc xong thấy ấm lòng ghê.",
  "Cảm ơn bạn đã chia sẻ, mình lưu lại rồi.",
  "Mình cũng từng như vậy, đồng cảm lắm.",
  "Bài viết dễ hiểu, mong bạn viết thêm phần sau.",
  "Đoạn cuối hay quá!",
  "Mình thử làm theo và thấy hiệu quả thật.",
  "Có ai ở gần đây muốn đi cùng không?",
  "Bạn có thể nói rõ hơn chỗ này không?",
  "Nhớ hồi xưa quá trời.",
  "Ghé xóm mấy hôm nay, bài này thích nhất.",
];
const replyPool = [
  "Đúng rồi đó bạn.",
  "Cảm ơn bạn nha!",
  "Mình cũng nghĩ vậy.",
  "Hay quá, để mình thử.",
];

function excerptOf(title: string): string {
  return `${title}. Vài dòng chia sẻ từ một hàng xóm trong xóm nhỏ.`.slice(0, 160);
}

function contentOf(title: string): string {
  return [
    `## ${title}`,
    "",
    "Mình viết bài này sau một thời gian để ý chuyện quanh mình. Hy vọng có ích cho bạn.",
    "",
    "- Điều thứ nhất: bắt đầu từ việc nhỏ.",
    "- Điều thứ hai: kiên nhẫn với chính mình.",
    "- Điều thứ ba: hỏi hàng xóm khi cần.",
    "",
    "Bạn nghĩ sao? Để lại bình luận cho mình biết nhé.",
  ].join("\n");
}

async function main() {
  for (const user of users) {
    const data = {
      name: user.name,
      email: `${user.username}@xomnho.local`,
      emailVerified: true,
      username: user.username,
      role: user.role,
      bio: `Xin chào, mình là ${user.name}.`,
    };
    await prisma.user.upsert({
      where: { id: user.id },
      create: { id: user.id, ...data },
      update: data,
    });
  }

  // Tài khoản "credential" của Better Auth: accountId là id người dùng, mật khẩu băm bằng hàm của Better Auth
  const passwordHash = await hashPassword(SEED_PASSWORD);
  for (const user of users) {
    const data = {
      accountId: user.id,
      providerId: "credential",
      userId: user.id,
      password: passwordHash,
    };
    await prisma.account.upsert({
      where: { id: `${user.id}-credential` },
      create: { id: `${user.id}-credential`, ...data },
      update: data,
    });
  }

  const categoryIds: string[] = [];
  for (const [index, category] of categories.entries()) {
    const data = { ...category, slug: slugify(category.name), sortOrder: index };
    const row = await prisma.category.upsert({
      where: { name: category.name },
      create: data,
      update: data,
    });
    categoryIds.push(row.id);
  }

  const tagIds: string[] = [];
  for (const name of tags) {
    const row = await prisma.tag.upsert({
      where: { name },
      create: { name, slug: slugify(name) },
      update: { slug: slugify(name) },
    });
    tagIds.push(row.id);
  }

  const authorIds = users.map((u) => u.id);
  const publishedPostIds: string[] = [];

  for (const [index, [title, categoryIndex, tagIndexes, status]] of posts.entries()) {
    const slug = slugify(title);
    const excerpt = excerptOf(title);
    const authorId = authorIds[index % authorIds.length]!;
    const isPublic = status === "PUBLISHED" || status === "ARCHIVED";
    const data = {
      title,
      excerpt,
      content: contentOf(title),
      searchText: buildPostSearchText({
        title,
        excerpt,
        tagNames: tagIndexes.map((i) => tags[i]!),
      }),
      status,
      rejectReason:
        status === "REJECTED" ? "Bài còn ngắn, bạn bổ sung thêm trải nghiệm thật nhé." : null,
      viewCount: isPublic ? (index * 37) % 500 : 0,
      authorId,
      categoryId: categoryIds[categoryIndex]!,
      reviewerId: status === "PUBLISHED" || status === "REJECTED" ? "seed-admin" : null,
      publishedAt: isPublic ? new Date(now - index * 2 * DAY) : null,
    };

    const post = await prisma.post.upsert({
      where: { slug },
      create: { slug, ...data },
      update: data,
    });

    await prisma.$transaction([
      prisma.postTag.deleteMany({ where: { postId: post.id } }),
      prisma.postTag.createMany({
        data: tagIndexes.map((i) => ({ postId: post.id, tagId: tagIds[i]! })),
      }),
    ]);

    if (status === "PUBLISHED") publishedPostIds.push(post.id);
  }

  // Bình luận: xóa của bài mẫu rồi tạo lại, mỗi bài đã đăng 3 bình luận gốc + 2 trả lời (20 bài = 100 bình luận)
  await prisma.comment.deleteMany({ where: { postId: { in: publishedPostIds } } });
  let n = 0;
  for (const postId of publishedPostIds) {
    const roots = [];
    for (let i = 0; i < 3; i++, n++) {
      roots.push(
        await prisma.comment.create({
          data: {
            postId,
            authorId: authorIds[n % authorIds.length]!,
            content: commentPool[n % commentPool.length]!,
            status: n % 17 === 0 ? "HIDDEN" : "VISIBLE",
          },
        }),
      );
    }
    for (let i = 0; i < 2; i++, n++) {
      await prisma.comment.create({
        data: {
          postId,
          parentId: roots[i]!.id,
          authorId: authorIds[(n + 1) % authorIds.length]!,
          content: replyPool[n % replyPool.length]!,
        },
      });
    }
  }

  console.info(
    `Seed xong: ${users.length} người dùng, ${categories.length} danh mục, ${tags.length} tag, ${posts.length} bài, ${n} bình luận.`,
  );
  console.info(
    `Đăng nhập: truongxom@xomnho.local (trưởng xóm), lananh@xomnho.local (cây bút), baongoc@xomnho.local (hàng xóm); mật khẩu ${SEED_PASSWORD}`,
  );
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
