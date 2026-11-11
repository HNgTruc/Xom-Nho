import type { PublicProfile } from "@xom-nho/api";
import type { Metadata } from "next";

/** Không có người này: tiêu đề chung, không cho máy tìm kiếm lập chỉ mục. */
export const PROFILE_NOT_FOUND_METADATA: Metadata = {
  title: "Không tìm thấy",
  robots: { index: false, follow: false },
};

/** Next không gộp sâu `openGraph` của trang với layout gốc: phải ghi lại các trường chung. */
const SITE_OPEN_GRAPH = { siteName: "Xóm Nhỏ", locale: "vi_VN" } as const;

/** Trang `/u/<username>`. Chưa có giới thiệu thì dùng câu chung. */
export function profileMetadata(profile: PublicProfile): Metadata {
  const title = profile.name;
  const description = profile.bio?.trim() || `Hồ sơ của ${profile.name} trên Xóm Nhỏ.`;
  return {
    title,
    description,
    openGraph: {
      ...SITE_OPEN_GRAPH,
      type: "profile",
      url: `/u/${profile.username}`,
      title,
      description,
      username: profile.username ?? undefined,
    },
    twitter: { card: "summary", title, description },
  };
}
