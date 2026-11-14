import type { UserSummary } from "@xom-nho/api";
import { avatarUrl } from "@xom-nho/api/api-client";
import { Avatar, AvatarFallback, AvatarImage } from "@xom-nho/ui/components/avatar";
import { API_URL } from "@/lib/env";

function initial(name: string): string {
  return (name.trim().split(/\s+/).at(-1)?.[0] ?? "?").toUpperCase();
}

/** Tác giả: avatar 24px nền `muted` (avatar người khác, pages/admin.md) và tên. */
export function AuthorCell({ author }: { author: UserSummary }) {
  const src = avatarUrl(API_URL, author);
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <Avatar className="size-6">
        {src && <AvatarImage src={src} alt="" />}
        <AvatarFallback className="bg-muted text-xs text-foreground">
          {initial(author.name)}
        </AvatarFallback>
      </Avatar>
      {author.name}
    </span>
  );
}
