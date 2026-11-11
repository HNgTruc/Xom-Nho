/**
 * Nội dung bài soạn kiểu mạng xã hội (`contentFormat: PLAIN`): chữ thường, đoạn cách nhau bằng dòng trống,
 * xuống dòng giữ nguyên. React tự thoát ký tự đặc biệt nên không chạy được mã chèn vào.
 */
export function PlainContent({ text }: { text: string }) {
  const paragraphs = text.split(/\n\s*\n/).filter((paragraph) => paragraph.trim() !== "");
  if (paragraphs.length === 0) return null;
  return (
    <div className="flex flex-col gap-4 text-lg leading-relaxed text-card-foreground">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="whitespace-pre-line break-words">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
