import { useQuery } from "@tanstack/react-query";
import {
  type AdminListUsersQuery,
  type AdminUserListItem,
  formatDate,
  formatDateTime,
  ROLE_LABELS,
  ROLE_VALUES,
  type Role,
} from "@xom-nho/api";
import { avatarUrl } from "@xom-nho/api/api-client";
import { Avatar, AvatarFallback, AvatarImage } from "@xom-nho/ui/components/avatar";
import { Badge } from "@xom-nho/ui/components/badge";
import { Button } from "@xom-nho/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@xom-nho/ui/components/dropdown-menu";
import { Input } from "@xom-nho/ui/components/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@xom-nho/ui/components/tabs";
import { Ban, MoreHorizontal, Search, ShieldCheck, UserX } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/state-message";
import { RoleBadge } from "@/components/common/status-badge";
import { type AdminColumnDef, adminColumnHelper } from "@/components/data-table/columns";
import { DataTable } from "@/components/data-table/data-table";
import { Pagination } from "@/components/data-table/pagination";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useNow } from "@/hooks/use-now";
import { API_URL } from "@/lib/env";
import { adminUsersListQuery, adminUsersStatsQuery } from "../api/users.queries";
import { useUserActions } from "../hooks/use-user-actions";
import { BanDialog } from "./ban-dialog";

const ALL = "ALL";
const BANNED = "BANNED";
const emptyRows: AdminUserListItem[] = [];
const numberFormat = new Intl.NumberFormat("vi-VN");
const rowButton = "size-8 max-lg:size-10";

function initial(name: string): string {
  return (name.trim().split(/\s+/).at(-1)?.[0] ?? "?").toUpperCase();
}

/** Đổi vai trò có dính tới trưởng xóm (nâng lên hay hạ xuống) thì hỏi lại; đổi giữa hàng xóm và cây bút thì làm luôn. */
type RoleChange = { user: AdminUserListItem; role: Role } | null;

/**
 * Bảng thành viên (docs/tinh-nang.md mục 4.5; pages/admin.md "Thành viên"): tab vai trò và "Đang bị cấm" có số đếm,
 * tìm theo tên hoặc email. Dòng của chính mình có "(bạn)" và khóa đổi vai trò, cấm (title giải thích); trưởng xóm
 * khác không cấm được (hạ vai trò trước). Avatar của mình nền `accent`, người khác nền `muted`.
 */
export function UsersTable({
  query,
  meId,
  onChange,
}: {
  query: AdminListUsersQuery;
  meId: string | undefined;
  onChange: (
    values: Record<string, string | number | undefined>,
    opts?: { resetPage?: boolean },
  ) => void;
}) {
  const id = useId();
  const now = useNow();
  const list = useQuery(adminUsersListQuery(query));
  const stats = useQuery(adminUsersStatsQuery);
  const actions = useUserActions();
  const [banTarget, setBanTarget] = useState<AdminUserListItem | null>(null);
  const [roleChange, setRoleChange] = useState<RoleChange>(null);

  const [search, setSearch] = useState(query.q ?? "");
  const debouncedSearch = useDebouncedValue(search);
  useEffect(() => {
    if ((query.q ?? "") !== debouncedSearch.trim())
      onChange({ q: debouncedSearch.trim() || undefined });
  }, [debouncedSearch, query.q, onChange]);

  const columns = useMemo<AdminColumnDef<AdminUserListItem>[]>(() => {
    const helper = adminColumnHelper<AdminUserListItem>();
    const changeRole = (user: AdminUserListItem, role: Role) => {
      if (role === user.role) return;
      if (role === "admin" || user.role === "admin") setRoleChange({ user, role });
      else actions.setRole.mutate({ user, role });
    };
    return [
      helper.display({
        id: "member",
        header: "Thành viên",
        cell: ({ row }) => {
          const user = row.original;
          const isMe = user.id === meId;
          const src = avatarUrl(API_URL, user);
          return (
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="size-8">
                {src && <AvatarImage src={src} alt="" />}
                <AvatarFallback
                  className={isMe ? "bg-accent text-accent-foreground" : "bg-muted text-foreground"}
                >
                  {initial(user.name)}
                </AvatarFallback>
              </Avatar>
              {/* Giới hạn bề ngang để email dài không đẩy mất cột vai trò, nút thao tác trên điện thoại */}
              <div className="flex min-w-0 max-w-28 flex-col sm:max-w-64 lg:max-w-80">
                <span className="truncate font-medium" title={user.name}>
                  {user.name}
                  {isMe && <span className="font-normal text-muted-foreground"> (bạn)</span>}
                </span>
                <span className="truncate text-xs text-muted-foreground" title={user.email}>
                  {user.username && (
                    <>
                      @{user.username}
                      <span className="max-sm:hidden"> · </span>
                    </>
                  )}
                  <span className={user.username ? "max-sm:hidden" : undefined}>{user.email}</span>
                </span>
              </div>
            </div>
          );
        },
      }),
      helper.display({
        id: "role",
        header: "Vai trò",
        cell: ({ row }) => <RoleBadge role={row.original.role} />,
      }),
      helper.display({
        id: "status",
        header: "Tình trạng",
        cell: ({ row }) => {
          const user = row.original;
          if (!user.banned) return <span className="text-muted-foreground">Bình thường</span>;
          return (
            <span className="flex flex-col items-start gap-1">
              <Badge variant="destructive" className="h-5 px-1.5 text-xs [&>svg]:size-3.5!">
                <Ban aria-hidden="true" strokeWidth={1.75} />
                {user.banExpires
                  ? `Cấm đến ${formatDateTime(user.banExpires, now)}`
                  : "Cấm vĩnh viễn"}
              </Badge>
              {user.banReason && (
                <span
                  className="line-clamp-1 max-w-56 text-xs text-muted-foreground"
                  title={user.banReason}
                >
                  {user.banReason}
                </span>
              )}
            </span>
          );
        },
      }),
      helper.display({
        id: "posts",
        header: "Bài viết",
        cell: ({ row }) => (
          <span className="tabular-nums">{numberFormat.format(row.original.postCount)}</span>
        ),
      }),
      helper.display({
        id: "comments",
        header: "Bình luận",
        cell: ({ row }) => (
          <span className="tabular-nums">{numberFormat.format(row.original.commentCount)}</span>
        ),
      }),
      helper.display({
        id: "joined",
        header: "Tham gia",
        cell: ({ row }) => (
          <time
            dateTime={row.original.createdAt}
            className="whitespace-nowrap text-muted-foreground"
          >
            {formatDate(row.original.createdAt, now)}
          </time>
        ),
      }),
      helper.display({
        id: "actions",
        header: () => <span className="sr-only">Thao tác</span>,
        cell: ({ row }) => {
          const user = row.original;
          if (user.id === meId) {
            // Không tự đổi vai trò, không tự cấm (backend cũng chặn): khóa nút, giải thích bằng title
            return (
              <Button
                variant="ghost"
                size="icon"
                className={rowButton}
                disabled
                title="Không đổi được vai trò hay cấm chính mình"
                aria-label="Không có thao tác với tài khoản của bạn"
              >
                <MoreHorizontal aria-hidden="true" className="size-4" />
              </Button>
            );
          }
          return (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={rowButton}
                  aria-label={`Thao tác với ${user.name}`}
                >
                  <MoreHorizontal aria-hidden="true" className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                  Vai trò
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={user.role}
                  onValueChange={(value) => changeRole(user, value as Role)}
                >
                  {ROLE_VALUES.map((role) => (
                    <DropdownMenuRadioItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                {user.banned ? (
                  <DropdownMenuItem onSelect={() => actions.unban.mutate(user)}>
                    <ShieldCheck aria-hidden="true" />
                    Bỏ cấm
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={user.role === "admin"}
                    onSelect={() => setBanTarget(user)}
                  >
                    <Ban aria-hidden="true" />
                    {user.role === "admin" ? "Cấm… (hạ vai trò trước)" : "Cấm…"}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ];
  }, [now, meId, actions.setRole, actions.unban]);

  const byRole = stats.data?.byRole;
  const tabs: { value: string; label: string; count: number | undefined }[] = [
    { value: ALL, label: "Tất cả", count: stats.data?.total },
    ...ROLE_VALUES.map((role) => ({
      value: role,
      label: ROLE_LABELS[role],
      count: byRole?.[role],
    })),
    { value: BANNED, label: "Đang bị cấm", count: stats.data?.banned },
  ];
  const activeTab = query.banned ? BANNED : (query.role ?? ALL);
  const filtered = Boolean(query.q || query.role || query.banned);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) =>
        onChange({
          role: value === ALL || value === BANNED ? undefined : value,
          banned: value === BANNED ? "true" : undefined,
        })
      }
    >
      <TabsList aria-label="Lọc theo vai trò, tình trạng">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
            {tab.count !== undefined && (
              <span className="rounded-full bg-foreground/8 px-1.5 text-xs tabular-nums in-data-[state=active]:bg-primary-foreground/20">
                {numberFormat.format(tab.count)}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={activeTab} className="flex flex-col gap-3">
        <div className="glass flex min-h-14 items-center gap-2 rounded-xl px-3 py-2">
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <label htmlFor={`${id}-search`} className="sr-only">
              Tìm thành viên
            </label>
            <Input
              id={`${id}-search`}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên hoặc email"
              className="pl-9"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={list.data?.data ?? emptyRows}
          getRowId={(user) => user.id}
          caption="Thành viên, mới tham gia trước"
          isPending={list.isPending}
          isError={list.isError}
          onRetry={() => void list.refetch()}
          columnClassNames={{
            comments: "max-xl:hidden",
            posts: "max-lg:hidden",
            joined: "max-md:hidden",
            status: "max-sm:hidden",
            role: "max-sm:px-2",
            actions: "w-12 max-sm:px-1",
          }}
          empty={
            <EmptyState
              icon={UserX}
              title={filtered ? "Không có thành viên nào khớp bộ lọc" : "Chưa có thành viên nào"}
              action={
                filtered ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch("");
                      onChange({ q: undefined, role: undefined, banned: undefined });
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                ) : undefined
              }
            />
          }
          footer={
            list.data && (
              <Pagination
                meta={list.data.meta}
                unit="thành viên"
                onPageChange={(page) => onChange({ page }, { resetPage: false })}
                onPageSizeChange={(pageSize) => onChange({ pageSize })}
              />
            )
          }
        />
      </TabsContent>

      <BanDialog
        user={banTarget}
        onOpenChange={(open) => !open && setBanTarget(null)}
        onConfirm={async ({ reason, expiresAt }) => {
          if (banTarget) await actions.ban.mutateAsync({ user: banTarget, reason, expiresAt });
        }}
      />
      <ConfirmDialog
        open={roleChange !== null}
        onOpenChange={(open) => !open && setRoleChange(null)}
        title={
          roleChange ? `Đổi ${roleChange.user.name} thành ${ROLE_LABELS[roleChange.role]}?` : ""
        }
        description={
          roleChange?.role === "admin"
            ? "Người này sẽ vào được trang quản trị và làm mọi việc như bạn: ẩn bài, cấm thành viên, đổi vai trò."
            : "Người này sẽ không vào được trang quản trị nữa."
        }
        confirmLabel="Đổi vai trò"
        onConfirm={async () => {
          if (roleChange) await actions.setRole.mutateAsync(roleChange);
        }}
      />
    </Tabs>
  );
}
