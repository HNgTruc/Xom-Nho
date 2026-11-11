import { Injectable } from "@nestjs/common";
import { POST_STATUSES, type PostListItem, type SearchQuery } from "@xom-nho/api";
import { paginate, type Paginated } from "../../common/types/paginated.js";
import { PostsService } from "../posts/posts.service.js";
import { toBooleanQuery } from "./search.query.js";
import { SearchRepository } from "./search.repository.js";

@Injectable()
export class SearchService {
  constructor(
    private readonly searchRepository: SearchRepository,
    private readonly postsService: PostsService,
  ) {}

  /**
   * Tìm bài đã đăng theo tiêu đề, tóm tắt, tag; có dấu hay không đều được. Ai cũng xem được.
   * Từ khóa rỗng (hoặc chỉ có ký tự đặc biệt) trả trang rỗng, không chạm database.
   */
  async search(query: SearchQuery): Promise<Paginated<PostListItem>> {
    const { q, category, page, pageSize } = query;
    const booleanQuery = toBooleanQuery(q);
    if (!booleanQuery) return paginate([], 0, page, pageSize);

    const [ids, total] = await this.searchRepository.findIds(
      { booleanQuery, status: POST_STATUSES.PUBLISHED, categorySlug: category },
      { skip: (page - 1) * pageSize, take: pageSize },
    );
    // Dựng PostListItem qua module posts để kết quả tìm kiếm giống hệt danh sách thường
    const items = await this.postsService.listPublishedByIds(ids);
    return paginate(items, total, page, pageSize);
  }
}
