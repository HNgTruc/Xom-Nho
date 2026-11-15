import type { NestExpressApplication } from "@nestjs/platform-express";
import { FRIEND_MESSAGES } from "@xom-nho/api";
import request from "supertest";
import type { PrismaClient } from "../../src/generated/prisma/client.js";
import { createTestApp } from "../fixtures/app.js";
import { createTestPrisma, resetDatabase } from "../fixtures/database.js";
import { signUp } from "../fixtures/session.js";

type Account = { cookie: string; id: string };

/** Kết bạn, chặn (docs/tinh-nang.md mục 1.5, docs/api.md mục "Bạn bè, chặn"). */
describe("Bạn bè, chặn (/api/v1/friends, /api/v1/blocks)", () => {
  let app: NestExpressApplication;
  let prisma: PrismaClient;
  let lan: Account;
  let minh: Account;
  let author: Account;
  let admin: Account;

  const http = () => request(app.getHttpServer());
  const addFriend = (who: Account, userId: string) =>
    http().put(`/api/v1/friends/${userId}`).set("Cookie", who.cookie);
  const removeFriend = (who: Account, userId: string) =>
    http().delete(`/api/v1/friends/${userId}`).set("Cookie", who.cookie);
  const block = (who: Account, userId: string) =>
    http().put(`/api/v1/blocks/${userId}`).set("Cookie", who.cookie);
  const unblock = (who: Account, userId: string) =>
    http().delete(`/api/v1/blocks/${userId}`).set("Cookie", who.cookie);
  const profile = async (who: Account, username: string) =>
    (await http().get(`/api/v1/users/${username}`).set("Cookie", who.cookie).expect(200)).body.data;
  const get = async (who: Account, path: string) =>
    (await http().get(`/api/v1${path}`).set("Cookie", who.cookie).expect(200)).body;
  const rowCount = () => prisma.friendship.count();

  beforeAll(async () => {
    app = await createTestApp();
    prisma = createTestPrisma();
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
    lan = await signUp(app, prisma, "lan@test.local");
    minh = await signUp(app, prisma, "minh@test.local");
    author = await signUp(app, prisma, "khoa@test.local", "author");
    admin = await signUp(app, prisma, "admin@test.local", "admin");
    for (const [account, username] of [
      [lan, "lan"],
      [minh, "minh"],
      [author, "khoa"],
      [admin, "truongxom"],
    ] as const) {
      await prisma.user.update({ where: { id: account.id }, data: { username } });
    }
  });

  afterAll(async () => {
    await resetDatabase(prisma);
    await prisma.$disconnect();
    await app.close();
  });

  it("hai tài khoản kết bạn được: mời, thấy lời mời, chấp nhận, cùng đếm 1 bạn", async () => {
    const sent = await addFriend(lan, minh.id).expect(200);
    expect(sent.body.data).toEqual({
      relationship: { status: "outgoing", blockedByMe: false, canRequest: false },
      friendCount: 0,
    });

    expect((await profile(minh, "lan")).relationship).toEqual({
      status: "incoming",
      blockedByMe: false,
      canRequest: true,
    });
    const incoming = await get(minh, "/friends/requests");
    expect(incoming.data).toEqual([
      {
        user: expect.objectContaining({ id: lan.id, username: "lan" }),
        createdAt: expect.any(String),
      },
    ]);
    const outgoing = await get(lan, "/friends/requests?direction=outgoing");
    expect(outgoing.data.map((item: { user: { id: string } }) => item.user.id)).toEqual([minh.id]);

    const accepted = await addFriend(minh, lan.id).expect(200);
    expect(accepted.body.data).toEqual({
      relationship: { status: "friends", blockedByMe: false, canRequest: false },
      friendCount: 1,
    });

    expect(await profile(minh, "lan")).toMatchObject({ friendCount: 1 });
    expect(await profile(lan, "minh")).toMatchObject({
      friendCount: 1,
      relationship: { status: "friends" },
    });
    const friends = await get(lan, "/friends");
    expect(friends.meta).toEqual({ page: 1, pageSize: 20, total: 1, totalPages: 1 });
    expect(friends.data[0]).toEqual({
      user: { id: minh.id, name: "minh", username: "minh", image: null, avatarId: null },
      since: expect.any(String),
    });
    expect(await get(minh, "/friends/requests")).toMatchObject({ data: [] });
  });

  it("hai người mời nhau cùng lúc thì thành bạn luôn, chỉ có một dòng", async () => {
    await Promise.all([addFriend(lan, minh.id).expect(200), addFriend(minh, lan.id).expect(200)]);

    expect(await rowCount()).toBe(1);
    expect((await profile(lan, "minh")).relationship.status).toBe("friends");
    expect((await profile(minh, "lan")).relationship.status).toBe("friends");
  });

  it("gửi lặp lại không tạo lời mời trùng", async () => {
    await addFriend(lan, minh.id).expect(200);
    const again = await addFriend(lan, minh.id).expect(200);

    expect(again.body.data.relationship.status).toBe("outgoing");
    expect(await rowCount()).toBe(1);
  });

  it("tự kết bạn với mình: 400; người không có: 404; khách: 401", async () => {
    const self = await addFriend(lan, lan.id).expect(400);
    expect(self.body.error.message).toBe(FRIEND_MESSAGES.SELF);
    await addFriend(lan, "khong-co-ai").expect(404);
    await http().put(`/api/v1/friends/${minh.id}`).expect(401);
    await http().get("/api/v1/friends").expect(401);
  });

  it("từ chối, hủy lời mời, hủy kết bạn đều gỡ quan hệ; gọi khi chưa có cũng không lỗi", async () => {
    await addFriend(lan, minh.id).expect(200);
    const declined = await removeFriend(minh, lan.id).expect(200);
    expect(declined.body.data.relationship.status).toBe("none");
    expect(await rowCount()).toBe(0);

    await addFriend(lan, minh.id).expect(200);
    await removeFriend(lan, minh.id).expect(200);
    expect(await rowCount()).toBe(0);

    await addFriend(lan, minh.id).expect(200);
    await addFriend(minh, lan.id).expect(200);
    const unfriended = await removeFriend(minh, lan.id).expect(200);
    expect(unfriended.body.data).toMatchObject({ friendCount: 0 });
    expect((await profile(lan, "minh")).friendCount).toBe(0);

    await removeFriend(lan, minh.id).expect(200);
  });

  describe("người bị cấm", () => {
    const banMinh = () =>
      prisma.user.update({ where: { id: minh.id }, data: { banned: true, banReason: "Spam" } });

    it("không nhận được lời mời: 403 với câu chung; hồ sơ vẫn xem được nhưng không có nút", async () => {
      await banMinh();

      const res = await addFriend(lan, minh.id).expect(403);
      expect(res.body.error.message).toBe(FRIEND_MESSAGES.CANNOT_REQUEST);
      const view = await profile(lan, "minh");
      expect(view.relationship).toEqual({ status: "none", blockedByMe: false, canRequest: false });
      expect(view).not.toHaveProperty("banned");
    });

    it("không gửi được lời mời (AuthGuard chặn trước)", async () => {
      await banMinh();

      await addFriend(minh, lan.id).expect(403);
      expect(await rowCount()).toBe(0);
    });

    it("bị cấm sau khi mời: lời mời còn nhưng chưa chấp nhận được, vẫn từ chối được", async () => {
      await addFriend(minh, lan.id).expect(200);
      await banMinh();

      await addFriend(lan, minh.id).expect(403);
      await removeFriend(lan, minh.id).expect(200);
      expect(await rowCount()).toBe(0);
    });
  });

  describe("chặn", () => {
    it("chặn thì mất bạn bè; hai bên không mời nhau được, cùng một câu báo", async () => {
      await addFriend(lan, minh.id).expect(200);
      await addFriend(minh, lan.id).expect(200);

      const blocked = await block(lan, minh.id).expect(200);
      expect(blocked.body.data).toEqual({
        relationship: { status: "none", blockedByMe: true, canRequest: false },
        friendCount: 0,
      });
      expect(await rowCount()).toBe(0);

      const byThem = await addFriend(minh, lan.id).expect(403);
      const byMe = await addFriend(lan, minh.id).expect(403);
      expect(byThem.body.error.message).toBe(FRIEND_MESSAGES.CANNOT_REQUEST);
      expect(byMe.body.error.message).toBe(FRIEND_MESSAGES.CANNOT_REQUEST);
    });

    it("người bị chặn không biết mình bị chặn: chỉ thấy không kết bạn được", async () => {
      await block(lan, minh.id).expect(200);

      expect((await profile(minh, "lan")).relationship).toEqual({
        status: "none",
        blockedByMe: false,
        canRequest: false,
      });
      expect((await profile(lan, "minh")).relationship.blockedByMe).toBe(true);
    });

    it("danh sách đã chặn, bỏ chặn thì mời lại được nhưng không tự thành bạn", async () => {
      await addFriend(lan, minh.id).expect(200);
      await addFriend(minh, lan.id).expect(200);
      await block(lan, minh.id).expect(200);
      await block(lan, minh.id).expect(200);

      const list = await get(lan, "/blocks");
      expect(list.meta.total).toBe(1);
      expect(list.data[0]).toEqual({
        user: expect.objectContaining({ id: minh.id }),
        blockedAt: expect.any(String),
      });
      expect(list.data[0].user).not.toHaveProperty("email");

      const unblocked = await unblock(lan, minh.id).expect(200);
      expect(unblocked.body.data.relationship).toEqual({
        status: "none",
        blockedByMe: false,
        canRequest: true,
      });
      await addFriend(minh, lan.id).expect(200);
      expect((await get(lan, "/blocks")).data).toEqual([]);
    });

    it("tự chặn mình: 400", async () => {
      const res = await block(lan, lan.id).expect(400);
      expect(res.body.error.message).toBe(FRIEND_MESSAGES.BLOCK_SELF);
    });
  });

  it("vai trò không ảnh hưởng: cây bút kết bạn với trưởng xóm, hàng xóm chặn được trưởng xóm", async () => {
    await addFriend(author, admin.id).expect(200);
    await addFriend(admin, author.id).expect(200);
    expect((await profile(author, "truongxom")).relationship.status).toBe("friends");

    await block(lan, admin.id).expect(200);
    await addFriend(admin, lan.id).expect(403);
  });

  it("hồ sơ của chính mình là self, có số bạn", async () => {
    await addFriend(lan, minh.id).expect(200);
    await addFriend(minh, lan.id).expect(200);

    expect(await profile(lan, "lan")).toMatchObject({
      friendCount: 1,
      relationship: { status: "self", blockedByMe: false, canRequest: false },
    });
  });
});
