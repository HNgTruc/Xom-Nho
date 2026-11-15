import type { SessionUser } from "../../common/types/session-user.js";
import { RateLimiter } from "../../infrastructure/rate-limit/rate-limiter.js";
import type { FriendshipRow, FriendsRepository, FriendTargetRow } from "./friends.repository.js";
import { FriendsService } from "./friends.service.js";

const lan = { id: "lan", role: "user", name: "Lan", email: "lan@test.local" } as SessionUser;
const minh: FriendTargetRow = { id: "minh", banned: false, banExpires: null };
// "lan" < "minh" nên lan là userLowId
const PAIR = { userLowId: "lan", userHighId: "minh" };

interface Setup {
  target?: FriendTargetRow | null;
  friendship?: FriendshipRow | null;
  blocks?: { blockedByMe: boolean; blockedByThem: boolean };
  inserted?: boolean;
  rateLimiter?: RateLimiter;
}

function setup({
  target = minh,
  friendship = null,
  blocks = { blockedByMe: false, blockedByThem: false },
  inserted = true,
  rateLimiter = new RateLimiter(),
}: Setup = {}) {
  const repository = {
    findTarget: vi.fn().mockResolvedValue(target),
    findPair: vi.fn().mockResolvedValue(friendship),
    findBlocks: vi.fn().mockResolvedValue(blocks),
    insertRequest: vi.fn().mockResolvedValue(inserted),
    accept: vi.fn().mockResolvedValue(undefined),
    deletePair: vi.fn().mockResolvedValue(undefined),
    countFriends: vi.fn().mockResolvedValue(2),
    block: vi.fn().mockResolvedValue(undefined),
    unblock: vi.fn().mockResolvedValue(undefined),
  };
  const service = new FriendsService(repository as unknown as FriendsRepository, rateLimiter);
  return { service, repository };
}

describe("FriendsService.add", () => {
  it("chưa có quan hệ thì ghi lời mời với khóa cặp đã sắp, người gửi là mình", async () => {
    const { service, repository } = setup();
    repository.findPair
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ requesterId: "lan", status: "PENDING" });

    const state = await service.add(lan, "minh");

    expect(repository.insertRequest).toHaveBeenCalledWith(PAIR, "lan");
    expect(repository.accept).not.toHaveBeenCalled();
    expect(state).toEqual({
      relationship: { status: "outgoing", blockedByMe: false, canRequest: false },
      friendCount: 2,
    });
    expect(repository.countFriends).toHaveBeenCalledWith("minh");
  });

  it("người kia đã mời mình thì chấp nhận, không ghi lời mời mới", async () => {
    const { service, repository } = setup({
      friendship: { requesterId: "minh", status: "PENDING" },
    });

    await service.add(lan, "minh");

    expect(repository.accept).toHaveBeenCalledWith(PAIR, expect.any(Date));
    expect(repository.insertRequest).not.toHaveBeenCalled();
  });

  it("hai bên mời cùng lúc: ghi không được vì người kia vừa ghi thì chấp nhận luôn", async () => {
    const { service, repository } = setup({ inserted: false });
    repository.findPair
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ requesterId: "minh", status: "PENDING" });

    await service.add(lan, "minh");

    expect(repository.accept).toHaveBeenCalledWith(PAIR, expect.any(Date));
  });

  it("bấm hai lần cùng lúc: dòng đã có là lời mời của chính mình thì giữ nguyên", async () => {
    const { service, repository } = setup({ inserted: false });
    repository.findPair
      .mockResolvedValueOnce(null)
      .mockResolvedValue({ requesterId: "lan", status: "PENDING" });

    await service.add(lan, "minh");

    expect(repository.accept).not.toHaveBeenCalled();
  });

  it.each([
    ["đã mời rồi", { requesterId: "lan", status: "PENDING" as const }, "outgoing"],
    ["đã là bạn", { requesterId: "minh", status: "ACCEPTED" as const }, "friends"],
  ])("%s thì giữ nguyên, không ghi gì", async (_label, friendship, status) => {
    const { service, repository } = setup({ friendship });

    const state = await service.add(lan, "minh");

    expect(state.relationship.status).toBe(status);
    expect(repository.insertRequest).not.toHaveBeenCalled();
    expect(repository.accept).not.toHaveBeenCalled();
  });

  it.each([
    ["người kia đang bị cấm", { target: { ...minh, banned: true } }],
    ["mình đã chặn người kia", { blocks: { blockedByMe: true, blockedByThem: false } }],
    ["người kia đã chặn mình", { blocks: { blockedByMe: false, blockedByThem: true } }],
  ])("%s thì FORBIDDEN với cùng một câu, không ghi gì", async (_label, options) => {
    const { service, repository } = setup(options);

    await expect(service.add(lan, "minh")).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "Không gửi được lời mời kết bạn cho người này.",
    });
    expect(repository.insertRequest).not.toHaveBeenCalled();
  });

  it("người kia bị cấm sau khi mời thì lời mời chưa chấp nhận được", async () => {
    const { service, repository } = setup({
      target: { ...minh, banned: true },
      friendship: { requesterId: "minh", status: "PENDING" },
    });

    await expect(service.add(lan, "minh")).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(repository.accept).not.toHaveBeenCalled();
  });

  it("cấm đã hết hạn thì coi như không bị cấm", async () => {
    const { service, repository } = setup({
      target: { ...minh, banned: true, banExpires: new Date("2000-01-01T00:00:00.000Z") },
    });

    await service.add(lan, "minh");

    expect(repository.insertRequest).toHaveBeenCalled();
  });

  it("tự kết bạn với mình thì VALIDATION_ERROR, không truy vấn", async () => {
    const { service, repository } = setup();

    await expect(service.add(lan, "lan")).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    expect(repository.findTarget).not.toHaveBeenCalled();
  });

  it("người không có, hay id sai dạng, thì NOT_FOUND", async () => {
    const { service, repository } = setup({ target: null });

    await expect(service.add(lan, "khongco")).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(service.add(lan, "a/b")).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(repository.findTarget).toHaveBeenCalledTimes(1);
  });

  it("quá 20 lời mời mới trong 10 phút thì RATE_LIMITED; chấp nhận không tính", async () => {
    const rateLimiter = new RateLimiter();
    const { service, repository } = setup({ rateLimiter });
    for (let i = 0; i < 20; i++) await service.add(lan, "minh");

    await expect(service.add(lan, "minh")).rejects.toMatchObject({ code: "RATE_LIMITED" });

    repository.findPair.mockResolvedValue({ requesterId: "minh", status: "PENDING" });
    await expect(service.add(lan, "minh")).resolves.toBeDefined();
  });
});

describe("FriendsService.remove, block, unblock", () => {
  it("gỡ quan hệ thì xóa dòng của cặp, trả trạng thái mới", async () => {
    const { service, repository } = setup();

    const state = await service.remove(lan, "minh");

    expect(repository.deletePair).toHaveBeenCalledWith(PAIR);
    expect(state.relationship).toEqual({ status: "none", blockedByMe: false, canRequest: true });
  });

  it("chặn thì gọi block với khóa cặp; sau đó không kết bạn được", async () => {
    const { service, repository } = setup();
    repository.findBlocks.mockResolvedValue({ blockedByMe: true, blockedByThem: false });

    const state = await service.block(lan, "minh");

    expect(repository.block).toHaveBeenCalledWith("lan", "minh", PAIR);
    expect(state.relationship).toEqual({ status: "none", blockedByMe: true, canRequest: false });
  });

  it("chặn được cả người đang bị cấm", async () => {
    const { service, repository } = setup({ target: { ...minh, banned: true } });

    await service.block(lan, "minh");

    expect(repository.block).toHaveBeenCalled();
  });

  it("tự chặn mình thì VALIDATION_ERROR", async () => {
    const { service } = setup();

    await expect(service.block(lan, "lan")).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      message: "Bạn không chặn chính mình được.",
    });
  });

  it("bỏ chặn chỉ xóa lượt chặn của mình", async () => {
    const { service, repository } = setup();

    await service.unblock(lan, "minh");

    expect(repository.unblock).toHaveBeenCalledWith("lan", "minh");
    expect(repository.deletePair).not.toHaveBeenCalled();
  });
});

describe("FriendsService.relationshipFor", () => {
  it("hồ sơ của mình là self, không truy vấn", async () => {
    const { service, repository } = setup();

    const relationship = await service.relationshipFor(lan, { ...minh, id: "lan" });

    expect(relationship).toEqual({ status: "self", blockedByMe: false, canRequest: false });
    expect(repository.findPair).not.toHaveBeenCalled();
  });

  it("người kia mời mình thì incoming, bấm được để chấp nhận", async () => {
    const { service } = setup({ friendship: { requesterId: "minh", status: "PENDING" } });

    await expect(service.relationshipFor(lan, minh)).resolves.toEqual({
      status: "incoming",
      blockedByMe: false,
      canRequest: true,
    });
  });
});
