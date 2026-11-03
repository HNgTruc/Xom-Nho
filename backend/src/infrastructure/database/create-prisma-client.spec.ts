import { toMariaDbConfig } from "./create-prisma-client.js";

describe("toMariaDbConfig", () => {
  it("tách đủ phần của DATABASE_URL", () => {
    expect(toMariaDbConfig("mysql://xomnho:bi-mat@localhost:3307/xom_nho")).toMatchObject({
      host: "localhost",
      port: 3307,
      user: "xomnho",
      password: "bi-mat",
      database: "xom_nho",
    });
  });

  it("giải mã ký tự đặc biệt trong mật khẩu", () => {
    expect(toMariaDbConfig("mysql://u:p%40ss%2Fw@db:3306/x").password).toBe("p@ss/w");
  });

  it("dùng cổng 3306 khi URL không ghi cổng", () => {
    expect(toMariaDbConfig("mysql://u:p@db/x").port).toBe(3306);
  });
});
