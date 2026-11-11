import { cn } from "@xom-nho/ui/lib/utils";
import type * as React from "react";
import type { ReactElement } from "react";
import Markdown, { type Components, defaultUrlTransform } from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

/**
 * Hiển thị Markdown của người dùng an toàn (docs/quyet-dinh/0003-hien-thi-markdown.md):
 * - Không có chuỗi HTML nào đi vào DOM: react-markdown dựng phần tử React, thẻ HTML thô trong bài bị bỏ
 *   (chỉ còn chữ bên trong).
 * - `rehype-sanitize` là lớp chặn thứ hai: chỉ giữ thẻ, thuộc tính trong danh sách cho phép (GitHub).
 * - `defaultUrlTransform` bỏ URL nguy hiểm (`javascript:`, `data:`...): liên kết thành chữ thường.
 * - Liên kết ra ngoài có `rel="nofollow ugc noopener"`, mở tab mới.
 * Dùng chung cho trang bài viết và phần xem trước của trình soạn (giai đoạn 4).
 */

export interface TocItem {
  id: string;
  text: string;
  /** 2: mục lớn, 3: mục con */
  depth: 2 | 3;
}

/** Kiểu tối thiểu của cây hast, đủ để đọc tiêu đề (không phụ thuộc gói `hast`). */
interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function textOf(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

/** Plugin rehype chạy sau `rehype-slug`: gom tiêu đề (đã có `id`) để dựng mục lục. */
function collectHeadings(target: TocItem[]) {
  return () => (tree: HastNode) => {
    const walk = (node: HastNode) => {
      // h1 trong bài hiện như h2 (trang đã có h1 là tiêu đề bài), nên tính là mục lớn
      const depth =
        node.tagName === "h1" || node.tagName === "h2" ? 2 : node.tagName === "h3" ? 3 : 0;
      const id = node.properties?.id;
      if (depth && typeof id === "string") {
        const text = textOf(node).trim();
        if (text) target.push({ id, text, depth: depth as 2 | 3 });
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

function isExternal(href: string): boolean {
  return /^(https?:)?\/\//i.test(href);
}

type HeadingTag = "h2" | "h3" | "h4" | "h5" | "h6";

function heading(Tag: HeadingTag, classes: string) {
  return function MarkdownHeading({
    node: _node,
    className,
    children,
    ...props
  }: React.ComponentProps<"h2"> & { node?: unknown }) {
    return (
      <Tag className={cn("font-sans font-semibold", classes, className)} {...props}>
        {children}
      </Tag>
    );
  };
}

// Chữ thân bài: Lora 18/1.7 (MASTER mục 3). Tiêu đề, bảng, code dùng font giao diện để dễ quét.
const components: Components = {
  // h1 trong bài hiện như h2: trang đã có h1 là tiêu đề bài
  h1: heading("h2", "mt-10 mb-4 scroll-mt-20 text-2xl"),
  h2: heading("h2", "mt-10 mb-4 scroll-mt-20 text-2xl"),
  h3: heading("h3", "mt-8 mb-3 scroll-mt-20 text-xl"),
  h4: heading("h4", "mt-6 mb-2 scroll-mt-20 text-lg"),
  h5: heading("h5", "mt-6 mb-2 text-base"),
  h6: heading("h6", "mt-6 mb-2 text-base"),
  p: ({ node: _node, className, ...props }) => <p className={cn("my-5", className)} {...props} />,
  ul: ({ node: _node, className, ...props }) => (
    <ul
      className={cn(
        "my-5 list-disc pl-6 [&_ol]:my-2 [&_ul]:my-2 [&.contains-task-list]:list-none [&.contains-task-list]:pl-0",
        className,
      )}
      {...props}
    />
  ),
  ol: ({ node: _node, className, ...props }) => (
    <ol className={cn("my-5 list-decimal pl-6 [&_ol]:my-2 [&_ul]:my-2", className)} {...props} />
  ),
  li: ({ node: _node, className, ...props }) => (
    <li className={cn("my-1.5 pl-1 [&>input]:mr-2 [&>input]:align-middle", className)} {...props} />
  ),
  blockquote: ({ node: _node, className, ...props }) => (
    <blockquote
      className={cn("my-6 border-l-4 border-border pl-4 text-muted-foreground italic", className)}
      {...props}
    />
  ),
  hr: ({ node: _node, className, ...props }) => (
    <hr className={cn("my-10 border-border", className)} {...props} />
  ),
  strong: ({ node: _node, className, ...props }) => (
    // Lora chỉ nạp 400 và 600: dùng 600 để trình duyệt không tự làm đậm giả
    <strong className={cn("font-semibold", className)} {...props} />
  ),
  code: ({ node: _node, className, ...props }) => (
    <code
      className={cn("rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[0.875em]", className)}
      {...props}
    />
  ),
  pre: ({ node: _node, className, ...props }) => (
    <pre
      className={cn(
        "my-6 overflow-x-auto rounded-md bg-muted p-4 font-mono text-sm leading-6 [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-[1em]",
        className,
      )}
      {...props}
    />
  ),
  table: ({ node: _node, className, ...props }) => (
    // Bảng rộng cuộn ngang trong khung riêng, trang không bị cuộn ngang
    <div className="my-6 overflow-x-auto">
      <table className={cn("w-full border-collapse font-sans text-base", className)} {...props} />
    </div>
  ),
  th: ({ node: _node, className, ...props }) => (
    <th
      className={cn("border-b border-input px-3 py-2 text-left font-semibold", className)}
      {...props}
    />
  ),
  td: ({ node: _node, className, ...props }) => (
    <td className={cn("border-b border-border px-3 py-2 align-top", className)} {...props} />
  ),
  a: ({ node: _node, className, href, children, ...props }) => {
    // URL bị defaultUrlTransform bỏ (javascript:...) thì còn rỗng: hiện chữ thường, không phải liên kết
    if (!href) return <span className={className}>{children}</span>;
    const external = isExternal(href);
    return (
      <a
        href={href}
        className={cn(
          "rounded-sm text-primary underline underline-offset-2 hover:decoration-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          className,
        )}
        {...(external ? { rel: "nofollow ugc noopener", target: "_blank" } : {})}
        {...props}
      >
        {children}
        {external && <span className="sr-only"> (mở trong tab mới)</span>}
      </a>
    );
  },
  img: ({ node: _node, className, alt, src, ...props }) =>
    typeof src === "string" && src ? (
      // Ảnh trong bài là URL bất kỳ do người viết dán, không biết trước kích thước, nên không dùng next/image.
      // no-referrer: trang chứa ảnh không biết người đọc đến từ bài nào.
      // oxlint-disable-next-line nextjs/no-img-element
      <img
        src={src}
        alt={alt ?? ""}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className={cn("my-6 h-auto max-w-full rounded-md", className)}
        {...props}
      />
    ) : null,
};

/**
 * Dựng Markdown một lần, trả cả phần tử lẫn mục lục (lấy từ cùng lần dựng nên `id` luôn khớp).
 * Chạy đồng bộ, dùng được trong Server Component và Client Component.
 */
export function renderMarkdown(content: string): { element: ReactElement; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const element = Markdown({
    children: content,
    remarkPlugins: [remarkGfm],
    // Thứ tự: lọc trước, rồi mới gắn id (sanitize đổi id thành "user-content-..." nếu chạy sau)
    rehypePlugins: [rehypeSanitize, rehypeSlug, collectHeadings(toc)],
    components,
    urlTransform: defaultUrlTransform,
  });
  return { element, toc };
}

/** Khung chữ thân bài: Lora 18/1.7, tối đa khoảng 70 ký tự mỗi dòng, chữ dài (URL) tự xuống dòng. */
export function MarkdownContent({
  children,
  className,
}: {
  children: ReactElement;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-[68ch] font-serif text-lg leading-[1.7] text-foreground [overflow-wrap:anywhere] [&>*:first-child]:mt-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
