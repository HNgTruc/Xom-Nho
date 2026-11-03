import type { PrismaClient } from "../../src/generated/prisma/client.js";
import { buildPostSearchText } from "../../src/modules/posts/posts.search-text.js";
import { createTestPrisma, resetDatabase } from "../fixtures/database.js";

/**
 * Kiểm tra index FULLTEXT trên post.searchText ở mức database (chưa qua module search).
 * Tái hiện lỗi stopword: index mặc định của InnoDB bỏ qua "an", "de", "la"... nên "do an" không ra "đồ ăn".
 * Sửa bởi migration rebuild_fulltext_without_stopwords.
 */
describe("FULLTEXT post.searchText", () => {
  let prisma: PrismaClient;

  async function countMatches(booleanQuery: string): Promise<number> {
    const rows = await prisma.$queryRaw<{ n: bigint }[]>`
      SELECT COUNT(*) AS n FROM post
      WHERE MATCH(searchText) AGAINST(${booleanQuery} IN BOOLEAN MODE)`;
    return Number(rows[0]?.n ?? 0);
  }

  beforeAll(async () => {
    prisma = createTestPrisma();
    await resetDatabase(prisma);

    await prisma.user.create({ data: { id: "u1", name: "Lan", email: "lan@test.local" } });
    const category = await prisma.category.create({ data: { name: "Đời sống", slug: "doi-song" } });
    const base = {
      content: "",
      authorId: "u1",
      categoryId: category.id,
      status: "PUBLISHED",
    } as const;

    const posts = [
      { title: "Đồ ăn đường phố Hà Nội", excerpt: "Để dành cuối tuần", tagNames: ["Ăn vặt"] },
      { title: "Bàn tròn cuối tuần", excerpt: "Là nơi hàng xóm trò chuyện", tagNames: [] },
      { title: "Đi chợ sáng", excerpt: "Mua rau", tagNames: ["Chợ"] },
    ];
    await prisma.post.createMany({
      data: posts.map((post, index) => ({
        ...base,
        title: post.title,
        slug: `bai-${index}`,
        excerpt: post.excerpt,
        searchText: buildPostSearchText(post),
      })),
    });
  });

  afterAll(async () => {
    await resetDatabase(prisma);
    await prisma.$disconnect();
  });

  it('tìm "do an" ra bài có "Đồ ăn" ("an" không bị coi là stopword)', async () => {
    expect(await countMatches("+do +an")).toBe(1);
  });

  it.each([
    ["an", 1],
    ["de", 1],
    ["la", 1],
    ["di", 1],
  ])('từ ngắn tiếng Việt "%s" vẫn được lập chỉ mục', async (word, expected) => {
    expect(await countMatches(`+${word}`)).toBe(expected);
  });

  it('tìm "ban tron" ra bài "Bàn tròn"', async () => {
    expect(await countMatches("+ban +tron")).toBe(1);
  });

  it("từ không có trong bài nào thì không ra kết quả", async () => {
    expect(await countMatches("+pho +bo")).toBe(0);
  });
});
