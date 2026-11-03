import { CategoriesService } from "./categories.service.js";
import type { CategoriesRepository, CategoryListRow } from "./categories.repository.js";

function setup(rows: CategoryListRow[]) {
  const repository = { findAll: vi.fn().mockResolvedValue(rows) };
  const service = new CategoriesService(repository as unknown as CategoriesRepository);
  return { service, repository };
}

describe("CategoriesService.list", () => {
  it("đổi bản ghi sang kiểu Category, số bài lấy từ _count", async () => {
    const { service } = setup([
      { id: "c1", name: "Đời sống", slug: "doi-song", description: null, _count: { posts: 3 } },
    ]);

    await expect(service.list()).resolves.toEqual([
      { id: "c1", name: "Đời sống", slug: "doi-song", description: null, postCount: 3 },
    ]);
  });

  it("giữ nguyên thứ tự repository trả về", async () => {
    const { service } = setup([
      { id: "b", name: "B", slug: "b", description: null, _count: { posts: 0 } },
      { id: "a", name: "A", slug: "a", description: null, _count: { posts: 0 } },
    ]);

    const result = await service.list();

    expect(result.map((c) => c.id)).toEqual(["b", "a"]);
  });

  it("trả mảng rỗng khi chưa có danh mục", async () => {
    const { service } = setup([]);

    await expect(service.list()).resolves.toEqual([]);
  });
});
