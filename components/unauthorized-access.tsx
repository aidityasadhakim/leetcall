import { X } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { TypographyH2, TypographyP } from "./typography/typography";

export const UnauthorizedAccess = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="max-w-md space-y-4 p-6">
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <X className="h-6 w-6 text-destructive" />
          </div>
        </div>
        <TypographyH2 className="text-center">Access Denied</TypographyH2>
        <TypographyP className="text-center text-muted-foreground">
          You don&apos;t have permission to access this workspace. Please contact the workspace owner
          if you believe this is a mistake.
        </TypographyP>
        <div className="flex justify-center pt-2">
          <Button asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};