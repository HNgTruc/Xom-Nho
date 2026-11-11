import { Injectable } from "@nestjs/common";
import { pathUsernameSchema, POST_STATUSES, type PublicProfile } from "@xom-nho/api";
import { AppException } from "../../common/exceptions/app-exception.js";
import { toPublicProfile } from "./users.mapper.js";
import { UsersRepository } from "./users.repository.js";

const USER_NOT_FOUND = "Không tìm thấy hàng xóm này. Bạn kiểm tra lại đường dẫn nhé.";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Hồ sơ công khai theo username, ai cũng xem được. Người bị cấm vẫn có hồ sơ (bài cũ của họ vẫn hiện),
   * nhưng hồ sơ không cho biết ai bị cấm. Username sai dạng (kể cả viết hoa) coi là không có.
   */
  async getProfile(username: string): Promise<PublicProfile> {
    if (!pathUsernameSchema.safeParse(username).success) {
      throw new AppException("NOT_FOUND", USER_NOT_FOUND);
    }
    const row = await this.usersRepository.findProfile(username, POST_STATUSES.PUBLISHED);
    if (!row) throw new AppException("NOT_FOUND", USER_NOT_FOUND);
    return toPublicProfile(row);
  }
}
