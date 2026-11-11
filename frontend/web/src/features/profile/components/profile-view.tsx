import { FEED_MESSAGES } from "@xom-nho/api";
import { Button } from "@xom-nho/ui/components/button";
import { Settings } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/common/error-state";
import { getCurrentUser, requireUser } from "@/features/auth";
import { PostFeed, PostListSkeleton } from "@/features/posts";
import type { RawSearchParams } from "@/lib/search-params";
import { getProfile } from "../api/get-profile";
import { ProfileHeader, ProfileHeaderSkeleton } from "./profile-header";

/** Nút của chủ hồ sơ. Đọc cookie nên nằm trong `<Suspense>`; không phải chủ (hoặc lỗi) thì không hiện gì. */
async function OwnerActions({ profileId }: { profileId: string }) {
  const me = await getCurrentUser().catch(() => null);
  if (me?.id !== profileId) return null;

  return (
    <Button asChild variant="outline">
      <Link href="/cai-dat">
        <Settings aria-hidden="true" />
        Sửa hồ sơ
      </Link>
    </Button>
  );
}

/**
 * Trang `/u/<username>` (docs/tinh-nang.md mục 1.3): đầu trang hồ sơ rồi các bài đã đăng của người này.
 * Chỉ cho thành viên (ADR 0007). Đọc `params` nên phải nằm trong `<Suspense>`. Không có người này thì 404.
 */
export async function ProfileView({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { username } = await params;
  await requireUser(`/u/${username}`);
  const profile = await getProfile(username);
  if (!profile?.username) notFound();

  return (
    <>
      <ProfileHeader
        profile={profile}
        actions={
          <Suspense fallback={null}>
            <OwnerActions profileId={profile.id} />
          </Suspense>
        }
      />
      <h2 className="sr-only">Bài viết của {profile.name}</h2>
      <ErrorBoundary message={FEED_MESSAGES.LOAD_ERROR}>
        <Suspense fallback={<PostListSkeleton />}>
          <PostFeed
            searchParams={searchParams}
            filter={{ author: profile.username }}
            basePath={`/u/${profile.username}`}
            emptyMessage={FEED_MESSAGES.PROFILE_EMPTY}
          />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

export function ProfileViewSkeleton() {
  return (
    <>
      <ProfileHeaderSkeleton />
      <PostListSkeleton />
    </>
  );
}
