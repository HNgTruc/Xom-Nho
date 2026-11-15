import { ADMIN_MESSAGES, type CategoryData } from "@xom-nho/api";
import {
  type AdminCategoryRow,
  type CategoriesRepository,
  CategoryNameTakenError,
} from "./categories.repository.js";
import { CategoriesService } from "./categories.service.js";

function row(overrides: Partial<AdminCategoryRow> = {}): AdminCategoryRow {
  return {
    id: "c1",
    name: "Đời sống",
    slug: "doi-song",
    description: null,
    color: "amber",
    icon: "tea",
    _count: { posts: 2 },
    totalPosts: 3,
    ...overrides,
  };
}

const input: CategoryData = { name: "Đời sống", description: null, color: "amber", icon: "tea" };

function setup(found: AdminCategoryRow | null = row()) {
  const repository = {
    findAllForAdmin: vi.fn().mockResolvedValue([row()]),
    findForAdmin: vi.fn().mockResolvedValue(found),
    findAllIds: vi.fn().mockResolvedValue(["c1", "c2"]),
    findSlugsStartingWith: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue("c1"),
    update: vi.fn().mockResolvedValue(undefined),
    reorder: vi.fn().mockResolvedValue(undefined),
    deleteIfEmpty: vi.fn().mockResolvedValue(0),
  };
  const service = new CategoriesService(repository as unknown as CategoriesRepository);
  return { service, repository };
}

describe("CategoriesService (quản trị)", () => {
  it("adminList: có số bài đã đăng và tổng số bài", async () => {
    const { service } = setup();

    await expect(service.adminList()).resolves.toEqual([
      {
        id: "c1",
        name: "Đời sống",
        slug: "doi-song",
        description: null,
        color: "amber",
        icon: "tea",
        postCount: 2,
        totalPostCount: 3,
      },
    ]);
  });

  it("create: đường dẫn sinh từ tên, bỏ dấu, đổi đ thành d", async () => {
    const { service, repository } = setup();

    await service.create({ ...input, name: "Đồ ăn Hà Nội" });

    expect(repository.create).toHaveBeenCalledWith({
      ...input,
      name: "Đồ ăn Hà Nội",
      slug: "do-an-ha-noi",
    });
  });

  it("create: đường dẫn đã có thì thêm -2, -3 (số nhỏ nhất còn trống)", async () => {
    const { service, repository } = setup();
    repository.findSlugsStartingWith.mockResolvedValue(["doi-song", "doi-song-2", "doi-song-xa"]);

    await service.create(input);

    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ slug: "doi-song-3" }));
  });

  it("create: tên chỉ có ký tự đặc biệt thì đường dẫn là danh-muc", async () => {
    const { service, repository } = setup();

    await service.create({ ...input, name: "???" });

    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ slug: "danh-muc" }));
  });

  it("create, update: tên trùng thì CONFLICT kèm lỗi ở ô tên", async () => {
    const { service, repository } = setup();
    repository.create.mockRejectedValue(new CategoryNameTakenError());
    repository.update.mockRejectedValue(new CategoryNameTakenError());
    const taken = {
      code: "CONFLICT",
      message: ADMIN_MESSAGES.CATEGORY_NAME_TAKEN,
      fields: { name: ADMIN_MESSAGES.CATEGORY_NAME_TAKEN },
    };

    await expect(service.create(input)).rejects.toMatchObject(taken);
    await expect(service.update("c1", input)).rejects.toMatchObject(taken);
  });

  it("update: không gửi đường dẫn xuống repository (đổi tên giữ nguyên slug)", async () => {
    const { service, repository } = setup();

    await service.update("c1", { ...input, name: "Chuyện xóm" });

    expect(repository.update).toHaveBeenCalledWith("c1", { ...input, name: "Chuyện xóm" });
  });

  it("reorder: đủ mọi danh mục thì lưu theo đúng thứ tự gửi lên", async () => {
    const { service, repository } = setup();

    await service.reorder({ ids: ["c2", "c1"] });

    expect(repository.reorder).toHaveBeenCalledWith(["c2", "c1"]);
  });

  it.each([[["c1"]], [["c1", "c2", "c3"]], [["c1", "c9"]]])(
    "reorder: danh sách %j lệch với database thì CONFLICT, không lưu",
    async (ids) => {
      const { service, repository } = setup();

      await expect(service.reorder({ ids })).rejects.toMatchObject({
        code: "CONFLICT",
        message: ADMIN_MESSAGES.CATEGORY_ORDER_INVALID,
      });
      expect(repository.reorder).not.toHaveBeenCalled();
    },
  );

  it("remove: còn bài thì CONFLICT", async () => {
    const { service, repository } = setup();
    repository.deleteIfEmpty.mockResolvedValue(3);

    await expect(service.remove("c1")).rejects.toMatchObject({
      code: "CONFLICT",
      message: ADMIN_MESSAGES.CATEGORY_HAS_POSTS,
    });
  });

  it("remove: không còn bài thì xóa", async () => {
    const { service, repository } = setup(row({ totalPosts: 0 }));

    await service.remove("c1");

    expect(repository.deleteIfEmpty).toHaveBeenCalledWith("c1");
  });

  it.each(["khong-co", "../c1"])("danh mục %j không có thì NOT_FOUND, không ghi", async (id) => {
    const { service, repository } = setup(null);
    const notFound = { code: "NOT_FOUND", message: ADMIN_MESSAGES.CATEGORY_NOT_FOUND };

    await expect(service.update(id, input)).rejects.toMatchObject(notFound);
    await expect(service.remove(id)).rejects.toMatchObject(notFound);
    expect(repository.update).not.toHaveBeenCalled();
    expect(repository.deleteIfEmpty).not.toHaveBeenCalled();
  });
});
