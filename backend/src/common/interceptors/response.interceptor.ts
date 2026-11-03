import type { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { map, type Observable } from "rxjs";
import type { Paginated } from "../types/paginated.js";

function isPaginated(value: unknown): value is Paginated<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as Paginated<unknown>).items) &&
    typeof (value as Paginated<unknown>).meta === "object"
  );
}

/** Bọc kết quả controller thành `{ data }`, hoặc `{ data, meta }` khi controller trả `Paginated`. */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next
      .handle()
      .pipe(
        map((result: unknown) =>
          isPaginated(result)
            ? { data: result.items, meta: result.meta }
            : { data: result ?? null },
        ),
      );
  }
}
