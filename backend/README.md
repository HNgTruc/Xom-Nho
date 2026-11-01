# backend

API NestJS của Xóm Nhỏ. Chưa khởi tạo, xem giai đoạn 0 trong [docs/lo-trinh.md](../docs/lo-trinh.md).

## Khởi tạo

`nest new` cần thư mục trống, nên tạo ở thư mục tạm rồi chép vào (giữ các thư mục và file đã có ở đây):

```bash
pnpm dlx @nestjs/cli new backend-tmp --package-manager pnpm --skip-git --skip-install --strict
cp -r backend-tmp/. backend/
rm -rf backend-tmp
```

Sau đó:

1. `package.json`: đặt `"name": "backend"`, thêm `"@xom-nho/shared": "workspace:*"`.
2. Đổi cổng mặc định trong `src/main.ts` thành `4000` (đọc từ biến `PORT`).
3. Xóa `app.controller.ts`, `app.service.ts` mẫu; dựng theo cây bên dưới.
4. Cài Prisma, Better Auth, Zod theo tài liệu bản mới nhất.

## Cây thư mục

```
backend/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   │   ├── env.schema.ts            Zod schema cho biến môi trường
│   │   └── config.module.ts
│   ├── common/
│   │   ├── decorators/              current-user.decorator.ts, roles.decorator.ts, public.decorator.ts
│   │   ├── guards/                  auth.guard.ts, roles.guard.ts
│   │   ├── pipes/                   zod-validation.pipe.ts
│   │   ├── filters/                 app-exception.filter.ts
│   │   ├── interceptors/            response.interceptor.ts
│   │   ├── exceptions/              app.exception.ts (mã lỗi theo docs/api.md)
│   │   └── utils/                   pagination.ts
│   ├── infrastructure/
│   │   ├── database/                prisma.module.ts, prisma.service.ts
│   │   ├── auth/                    better-auth.ts, auth.module.ts
│   │   ├── rate-limit/              rate-limit.service.ts
│   │   └── logger/
│   └── modules/
│       ├── auth/                    GET /me, PATCH /me
│       ├── users/                   hồ sơ công khai; admin: danh sách, đổi vai trò, cấm
│       ├── posts/                   bài viết; admin: duyệt, từ chối, ẩn, xóa
│       ├── comments/                bình luận; admin: ẩn/hiện
│       ├── categories/              đọc; admin: thêm/sửa/sắp xếp
│       ├── tags/                    gợi ý; admin: gộp, xóa
│       ├── search/                  tìm kiếm FULLTEXT
│       └── dashboard/               admin: số liệu tổng quan
└── test/
    ├── e2e/
    └── fixtures/
```

Mỗi module theo mẫu trong [docs/kien-truc.md](../docs/kien-truc.md#cấu-trúc-bên-trong-một-module-backend). Quy ước chi tiết: [CLAUDE.md](CLAUDE.md).
