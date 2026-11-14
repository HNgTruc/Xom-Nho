import { Button } from "@xom-nho/ui/components/button";
import { useSignOut } from "../hooks/use-sign-out";

export function SignOutButton() {
  const signOut = useSignOut();
  return (
    <Button
      variant="outline"
      size="sm"
      loading={signOut.pending}
      onClick={() => void signOut.run()}
    >
      Đăng xuất
    </Button>
  );
}
