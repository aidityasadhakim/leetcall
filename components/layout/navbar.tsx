"use client";

import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

export const Navbar = ({ user }: { user: User | null }) => {
  return (
    <nav className="fixed top-0 w-full z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">LeetCall</span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          {user ? (
            <Link href={`/dashboard/${user.id}`}>
              <Button variant="ghost" className="text-sm">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" className="text-sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="text-sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
