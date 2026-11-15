import { ADMIN_MESSAGES } from "@xom-nho/api";
import type { AdminTagRow, TagsRepository } from "./tags.repository.js";
import { TagsService } from "./tags.service.js";

function tag(id: string, name: string, posts: number): AdminTagRow {
  return {
    id,
    name,
    slug: name.toLowerCase(),
    createdAt: new Date("2026-11-01T00:00:00.000Z"),
    _count: { posts },
  };
}

const defaultRows: Record<string, AdminTagRow> = {
  t1: tag("t1", "anvat", 2),
  t2: tag("t2", "doan", 5),
};

function setup(rows: Record<string, AdminTagRow> = defaultRows) {
  const repository = {
    findAdminList: vi.fn().mockResolvedValue([Object.values(rows), Object.keys(rows).length]),
    findAdminRow: vi.fn((id: string) => Promise.resolve(rows[id] ?? null)),
    merge: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  };
  const service = new TagsService(repository as unknown as TagsRepository);
  return { service, repository };
}

describe("TagsService (quản trị)", () => {
  it("adminList: tìm theo tên và slug đã bỏ dấu, phân trang", async () => {
    const { service, repository } = setup();

    const result = await service.adminList({ q: "Đồ ăn", sort: "posts", page: 2, pageSize: 20 });

    expect(repository.findAdminList).toHaveBeenCalledWith(
      { name: "Đồ ăn", slug: "do-an" },
      "posts",
      { skip: 20, take: 20 },
    );
    expect(result.items[0]).toEqual({
      id: "t1",
      name: "anvat",
      slug: "anvat",
      postCount: 2,
      createdAt: "2026-11-01T00:00:00.000Z",
    });
    expect(result.meta).toEqual({ page: 2, pageSize: 20, total: 2, totalPages: 1 });
  });

  it("adminList: không có từ khóa thì không lọc", async () => {
    const { service, repository } = setup();

    await service.adminList({ sort: "name", page: 1, pageSize: 20 });

    expect(repository.findAdminList).toHaveBeenCalledWith(
      { name: undefined, slug: undefined },
      "name",
      { skip: 0, take: 20 },
    );
  });

  it("merge: gộp rồi trả thẻ đích", async () => {
    const { service, repository } = setup();

    await expect(service.merge("t1", { targetId: "t2" })).resolves.toMatchObject({ id: "t2" });
    expect(repository.merge).toHaveBeenCalledWith("t1", "t2");
  });

  it("merge: gộp vào chính nó thì VALIDATION_ERROR, không ghi", async () => {
    const { service, repository } = setup();

    await expect(service.merge("t1", { targetId: "t1" })).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      message: ADMIN_MESSAGES.TAG_MERGE_SELF,
    });
    expect(repository.merge).not.toHaveBeenCalled();
  });

  it.each([
    ["t9", "t2"],
    ["t1", "t9"],
    ["../t1", "t2"],
  ])("merge %s vào %s: thẻ không có thì NOT_FOUND, không ghi", async (id, targetId) => {
    const { service, repository } = setup();

    await expect(service.merge(id, { targetId })).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: ADMIN_MESSAGES.TAG_NOT_FOUND,
    });
    expect(repository.merge).not.toHaveBeenCalled();
  });

  it("adminRemove: có thì xóa, không có thì NOT_FOUND", async () => {
    const { service, repository } = setup();

    await service.adminRemove("t1");
    expect(repository.delete).toHaveBeenCalledWith("t1");

    await expect(service.adminRemove("t9")).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
