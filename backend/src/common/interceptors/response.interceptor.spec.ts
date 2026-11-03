import type { CallHandler, ExecutionContext } from "@nestjs/common";
import { firstValueFrom, of } from "rxjs";
import { paginate } from "../types/paginated.js";
import { ResponseInterceptor } from "./response.interceptor.js";

function run(result: unknown) {
  const handler: CallHandler = { handle: () => of(result) };
  return firstValueFrom(new ResponseInterceptor().intercept({} as ExecutionContext, handler));
}

describe("ResponseInterceptor", () => {
  it("bọc dữ liệu thường trong data", async () => {
    await expect(run({ id: "1" })).resolves.toEqual({ data: { id: "1" } });
  });

  it("đưa meta của danh sách phân trang ra ngoài data", async () => {
    await expect(run(paginate(["a", "b"], 12, 2, 10))).resolves.toEqual({
      data: ["a", "b"],
      meta: { page: 2, pageSize: 10, total: 12, totalPages: 2 },
    });
  });

  it("đổi undefined thành data: null", async () => {
    await expect(run(undefined)).resolves.toEqual({ data: null });
  });
});
