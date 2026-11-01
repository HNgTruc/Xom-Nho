# Xóm Nhỏ

Diễn đàn nhỏ cho những người thích viết và thích trò chuyện. Ai cũng là hàng xóm.

- Đọc, tìm kiếm bài viết theo danh mục và tag
- Viết bài bằng Markdown, có xem trước
- Bình luận và trả lời bình luận
- Đăng nhập bằng email, Google hoặc GitHub
- Có web, app điện thoại, và trang quản trị riêng để duyệt bài, quản lý thành viên

> Trạng thái: đang dựng khung. Tiến độ ở [docs/lo-trinh.md](docs/lo-trinh.md).

## Kiến trúc

```
   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
   │ web          │   │ admin        │   │ mobile-app   │
   │ Next.js      │   │ React + Vite │   │ Expo         │
   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
          └──────────────────┼──────────────────┘
                       REST /api/v1
                    ┌────────┴────────┐
                    │ backend NestJS  │
                    │ Better Auth     │
                    │ Prisma          │
                    └────────┬────────┘
                       MySQL 8.4 (Docker)
```

| Thư mục                                        | Nội dung                                              |
| ---------------------------------------------- | ----------------------------------------------------- |
| [`backend/`](backend/)                         | API NestJS, đăng nhập, database                       |
| [`frontend/web/`](frontend/web/)               | Trang web cho người đọc và người viết                 |
| [`frontend/admin/`](frontend/admin/)           | Trang quản trị                                        |
| [`frontend/mobile-app/`](frontend/mobile-app/) | App Android / iOS                                     |
| [`ui/`](ui/)                                   | Design system: màu, chữ, component dùng chung         |
| [`shared/`](shared/)                           | Kiểu dữ liệu, kiểm tra dữ liệu, API client dùng chung |
| [`docs/`](docs/)                               | Tài liệu thiết kế                                     |

## Công nghệ

TypeScript · NestJS · Prisma · MySQL · Better Auth · Next.js · React + Vite · Expo · Tailwind CSS · shadcn/ui · TanStack Query · Zod · pnpm + Turborepo · Docker

## Chạy trên máy

Cần: Node.js 22+, pnpm, Docker Desktop, app Expo Go trên điện thoại.

```bash
cp .env.example .env            # rồi điền giá trị
docker compose up -d            # MySQL :3307, Adminer http://localhost:8080
pnpm install
pnpm --filter backend db:migrate
pnpm --filter backend db:seed
pnpm dev                        # backend :4000, web :3000, admin :5173, Expo
```

Chi tiết cho Windows và chạy app qua Wi-Fi: [docs/thiet-lap-moi-truong.md](docs/thiet-lap-moi-truong.md).

## Tài liệu

[Kiến trúc](docs/kien-truc.md) · [Cơ sở dữ liệu](docs/co-so-du-lieu.md) · [API](docs/api.md) · [Phân quyền](docs/phan-quyen.md) · [Tính năng](docs/tinh-nang.md) · [Lộ trình](docs/lo-trinh.md)

## Tác giả

Huỳnh Ngọc Trúc
