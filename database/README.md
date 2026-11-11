# database

Mọi thứ về dữ liệu của Xóm Nhỏ.

```
database/
├── docker-compose.yml     MySQL 8.4 (:3307) + Adminer (:8080) cho máy dev
├── mysql/init/            SQL chạy lần đầu tạo container (cấp quyền shadow database)
└── prisma/
    ├── schema.prisma      mô hình dữ liệu
    └── migrations/        migration đã commit, không sửa tay
```

## Lệnh (chạy ở gốc repo)

```bash
pnpm db:up                          # bật MySQL + Adminer
pnpm db:ps                          # xem trạng thái
pnpm db:down                        # tắt, giữ dữ liệu
pnpm --filter backend db:migrate    # tạo/áp migration (prisma migrate dev)
pnpm --filter backend db:seed       # dữ liệu mẫu (backend/scripts/seed.ts)
pnpm --filter backend db:studio
```

Prisma CLI chạy từ `backend`; `backend/prisma.config.ts` trỏ tới thư mục này và sinh client vào `backend/src/generated/prisma`. Thiết kế bảng: [docs/co-so-du-lieu.md](../docs/co-so-du-lieu.md).
