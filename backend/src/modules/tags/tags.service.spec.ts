import type { TagRow, TagsRepository } from "./tags.repository.js";
import { TagsService } from "./tags.service.js";

const anVat: TagRow = { id: "t1", name: "Ăn vặt", slug: "an-vat" };

function setup() {
  const repository = {
    suggest: vi.fn().mockResolvedValue([anVat]),
    findBySlug: vi.fn().mockResolvedValue(null),
  };
  const service = new TagsService(repository as unknown as TagsRepository);
  return { service, repository };
}

describe("TagsService.suggest", () => {
  it("tìm theo cả tên và slug đã bỏ dấu, tối đa 10 tag", async () => {
    const { service, repository } = setup();

    const tags = await service.suggest({ q: "Đồ ăn" });

    expect(repository.suggest).toHaveBeenCalledWith({ name: "Đồ ăn", slug: "do-an" }, 10);
    expect(tags).toEqual([{ id: "t1", name: "Ăn vặt", slug: "an-vat" }]);
  });

  it("q rỗng thì không lọc (tag dùng nhiều nhất)", async () => {
    const { service, repository } = setup();

    await service.suggest({ q: "" });

    expect(repository.suggest).toHaveBeenCalledWith({ name: undefined, slug: undefined }, 10);
  });

  it("q chỉ có ký tự đặc biệt thì chỉ lọc theo tên", async () => {
    const { service, repository } = setup();

    await service.suggest({ q: "#" });

    expect(repository.suggest).toHaveBeenCalledWith({ name: "#", slug: undefined }, 10);
  });
});

describe("TagsService.getBySlug", () => {
  it("trả tag khi có", async () => {
    const { service, repository } = setup();
    repository.findBySlug.mockResolvedValue(anVat);

    await expect(service.getBySlug("an-vat")).resolves.toEqual(anVat);
  });

  it("không có thì NOT_FOUND", async () => {
    const { service } = setup();

    await expect(service.getBySlug("khong-co")).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it.each(["An-Vat", "ăn vặt"])("slug %j sai dạng thì NOT_FOUND, không truy vấn", async (slug) => {
    const { service, repository } = setup();

    await expect(service.getBySlug(slug)).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(repository.findBySlug).not.toHaveBeenCalled();
  });
});
