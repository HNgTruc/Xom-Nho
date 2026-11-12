import type { PublicProfile } from "@xom-nho/api";
import { describe, expect, it } from "vitest";
import { profileMetadata } from "./profile-metadata";

const profile: PublicProfile = {
  id: "u1",
  name: "Lan Anh",
  username: "lananh",
  image: null,
  avatarId: null,
  bio: "Thích nấu ăn, mê Hà Nội mùa đông.",
  role: "author",
  createdAt: "2026-10-01T00:00:00.000Z",
  postCount: 4,
};

describe("profileMetadata", () => {
  it("dùng tên và giới thiệu, Open Graph kiểu hồ sơ trỏ về trang hồ sơ", () => {
    const metadata = profileMetadata(profile);

    expect(metadata.title).toBe("Lan Anh");
    expect(metadata.description).toBe("Thích nấu ăn, mê Hà Nội mùa đông.");
    expect(metadata.openGraph).toMatchObject({
      type: "profile",
      url: "/u/lananh",
      siteName: "Xóm Nhỏ",
      locale: "vi_VN",
    });
  });

  it.each([null, "", "  "])("giới thiệu %j thì dùng câu chung", (bio) => {
    expect(profileMetadata({ ...profile, bio }).description).toBe(
      "Hồ sơ của Lan Anh trên Xóm Nhỏ.",
    );
  });
});
