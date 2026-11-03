import { toBooleanQuery } from "./search.query.js";

describe("toBooleanQuery", () => {
  it.each([
    ["ban tron", "+ban +tron"],
    ["Bàn Tròn", "+ban +tron"],
    ["đồ ăn", "+do +an"],
    ["  do   an  ", "+do +an"],
    ["ăn ăn ăn", "+an"],
    ["Hà Nội 2026", "+ha +noi +2026"],
  ])("%j thành %j", (q, expected) => {
    expect(toBooleanQuery(q)).toBe(expected);
  });

  it("chuỗi NFD (dán từ macOS) cũng bỏ dấu", () => {
    expect(toBooleanQuery("Bàn tròn".normalize("NFD"))).toBe("+ban +tron");
  });

  it("bỏ toán tử boolean, người dùng không chèn được điều kiện", () => {
    expect(toBooleanQuery('-ban +tron* "do an" (a) ~b <c >d @e')).toBe(
      "+ban +tron +do +an +a +b +c +d +e",
    );
  });

  it.each(["", "   ", '+-*"()', "!!!"])("%j không còn từ nào thì null", (q) => {
    expect(toBooleanQuery(q)).toBeNull();
  });
});
