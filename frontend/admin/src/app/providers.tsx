import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@xom-nho/ui/components/toaster";
import { TooltipProvider } from "@xom-nho/ui/components/tooltip";
import type { ReactNode } from "react";
import { queryClient } from "@/lib/query-client";

/** Bọc cả app: TanStack Query, tooltip (một provider chung), toast (một chỗ hiện, góc dưới phải). */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
