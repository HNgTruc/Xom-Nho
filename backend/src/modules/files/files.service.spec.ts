import type { RateLimiter } from "../../infrastructure/rate-limit/rate-limiter.js";
import type { StorageService } from "../../infrastructure/storage/storage.service.js";
import type { FilesRepository } from "./files.repository.js";
import { FilesService, ORPHAN_MAX_AGE_MS } from "./files.service.js";

const now = new Date("2026-11-12T10:00:00.000Z");
const cutoff = new Date(now.getTime() - ORPHAN_MAX_AGE_MS);

const orphan = (id: string) => ({ id, storageKey: `images/${id}.png` });

function setup() {
  const repository = {
    findOrphans: vi.fn(),
    deleteOrphans: vi.fn(async (ids: string[]) => ids),
  };
  const storage = { remove: vi.fn(async () => undefined) };
  const service = new FilesService(
    repository as unknown as FilesRepository,
    storage as unknown as StorageService,
    {} as RateLimiter,
  );
  return { service, repository, storage };
}

describe("FilesService.cleanupOrphans", () => {
  it("tìm file rác tạo trước mốc 1 ngày", async () => {
    const { service, repository } = setup();
    repository.findOrphans.mockResolvedValueOnce([]);

    await service.cleanupOrphans(now);

    expect(repository.findOrphans).toHaveBeenCalledWith(cutoff, 100);
  });

  it("không có file rác thì không xóa gì, trả 0", async () => {
    const { service, repository, storage } = setup();
    repository.findOrphans.mockResolvedValueOnce([]);

    expect(await service.cleanupOrphans(now)).toBe(0);
    expect(repository.deleteOrphans).not.toHaveBeenCalled();
    expect(storage.remove).not.toHaveBeenCalled();
  });

  it("xóa dòng rồi xóa file trên đĩa, trả số file đã dọn", async () => {
    const { service, repository, storage } = setup();
    repository.findOrphans.mockResolvedValueOnce([orphan("a"), orphan("b")]);

    expect(await service.cleanupOrphans(now)).toBe(2);
    expect(repository.deleteOrphans).toHaveBeenCalledWith(["a", "b"], cutoff);
    expect(storage.remove.mock.calls).toEqual([["images/a.png"], ["images/b.png"]]);
  });

  it("file vừa được gắn bài giữa chừng (dòng không bị xóa) thì giữ file trên đĩa", async () => {
    const { service, repository, storage } = setup();
    repository.findOrphans.mockResolvedValueOnce([orphan("a"), orphan("vua-gan")]);
    repository.deleteOrphans.mockResolvedValueOnce(["a"]);

    expect(await service.cleanupOrphans(now)).toBe(1);
    expect(storage.remove.mock.calls).toEqual([["images/a.png"]]);
  });

  it("xóa file trên đĩa lỗi thì vẫn dọn tiếp, không ném lỗi", async () => {
    const { service, repository, storage } = setup();
    repository.findOrphans.mockResolvedValueOnce([orphan("a"), orphan("b")]);
    storage.remove.mockRejectedValueOnce(new Error("EBUSY"));

    expect(await service.cleanupOrphans(now)).toBe(2);
    expect(storage.remove).toHaveBeenCalledTimes(2);
  });

  it("lô đầy thì dọn tiếp lô sau, lô thiếu thì dừng", async () => {
    const { service, repository } = setup();
    const full = Array.from({ length: 100 }, (_, index) => orphan(`a${index}`));
    repository.findOrphans.mockResolvedValueOnce(full).mockResolvedValueOnce([orphan("b")]);

    expect(await service.cleanupOrphans(now)).toBe(101);
    expect(repository.findOrphans).toHaveBeenCalledTimes(2);
  });

  it("mỗi lần dọn tối đa 10 lô, còn thừa để lần sau", async () => {
    const { service, repository } = setup();
    const full = Array.from({ length: 100 }, (_, index) => orphan(`a${index}`));
    repository.findOrphans.mockResolvedValue(full);

    expect(await service.cleanupOrphans(now)).toBe(1000);
    expect(repository.findOrphans).toHaveBeenCalledTimes(10);
  });
});
