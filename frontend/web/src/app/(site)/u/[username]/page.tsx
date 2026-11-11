import type { Metadata } from "next";
import { Suspense } from "react";
import { FeedLayout } from "@/features/posts";
import {
  getProfile,
  PROFILE_NOT_FOUND_METADATA,
  ProfileView,
  ProfileViewSkeleton,
  profileMetadata,
} from "@/features/profile";

export async function generateMetadata({ params }: PageProps<"/u/[username]">): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfile(username).catch(() => null);
  return profile ? profileMetadata(profile) : PROFILE_NOT_FOUND_METADATA;
}

export default function ProfilePage({ params, searchParams }: PageProps<"/u/[username]">) {
  return (
    <FeedLayout>
      <Suspense fallback={<ProfileViewSkeleton />}>
        <ProfileView params={params} searchParams={searchParams} />
      </Suspense>
    </FeedLayout>
  );
}
