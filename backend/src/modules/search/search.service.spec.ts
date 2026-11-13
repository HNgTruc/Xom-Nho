import type { PostListItem } from "@xom-nho/api";
import type { SessionUser } from "../../common/types/session-user.js";
import type { PostsService } from "../posts/posts.service.js";
import type { SearchRepository } from "./search.repository.js";
import { SearchService } from "./search.service.js";

const item = { id: "p1", slug: "ban-tron" } as PostListItem;
const viewer: SessionUser = {
  id: "u1",
  name: "Lan Anh",
  email: "lananh@x.vn",
  username: "lananh",
  role: "user",
  banned: false,
};

function setup() {
  const repository = { findIds: vi.fn().mockResolvedValue([["p1"], 11]) };
  const postsService = { listPublishedByIds: vi.fn().mockResolvedValue([item]) };
  const service = new SearchService(
    repository as unknown as SearchRepository,
    postsService as unknown as PostsService,
  );
  return { service, repository, postsService };
}

describe("SearchService.search", () => {
  it("bỏ dấu từ khóa, chỉ tìm bài đã đăng, đổi trang thành skip/take", async () => {
    const { service, repository } = setup();

    await service.search(viewer, { q: "Bàn tròn", category: "doi-song", page: 2, pageSize: 10 });

    expect(repository.findIds).toHaveBeenCalledWith(
      { booleanQuery: "+ban +tron", status: "PUBLISHED", categorySlug: "doi-song" },
      { skip: 10, take: 10 },
    );
  });

  it("dựng kết quả qua PostsService, giữ thứ tự liên quan, tổng số từ truy vấn đếm", async () => {
    const { service, postsService } = setup();

    const result = await service.search(viewer, { q: "ban tron", page: 1, pageSize: 10 });

    expect(postsService.listPublishedByIds).toHaveBeenCalledWith(viewer, ["p1"]);
    expect(result).toEqual({
      items: [item],
      meta: { page: 1, pageSize: 10, total: 11, totalPages: 2 },
    });
  });

  it.each(["", "+-*()"])("từ khóa %j không còn từ nào thì trả rỗng, không truy vấn", async (q) => {
    const { service, repository, postsService } = setup();

    const result = await service.search(viewer, { q, page: 1, pageSize: 10 });

    expect(result).toEqual({ items: [], meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 } });
    expect(repository.findIds).not.toHaveBeenCalled();
    expect(postsService.listPublishedByIds).not.toHaveBeenCalled();
  });
});
