"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Folder, Share2, Settings, Menu, Check } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { signOutAction } from "@/app/actions";
import { User } from "@supabase/supabase-js";

// Components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { ThemeSwitcher } from "@/components/theme-switcher";

type SidebarState = "expanded" | "collapsed" | "hover";

interface SidebarProps {
  user: User | null;
}

const HOVER_DELAY = 100; // milliseconds

const Sidebar = ({ user }: SidebarProps) => {
  const pathname = usePathname();
  const [sidebarState, setSidebarState] = useState<SidebarState>("hover");
  const [isHovered, setIsHovered] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isCollapsed =
    sidebarState === "collapsed" || (sidebarState === "hover" && !isHovered);

  const navigation = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "My Workspace",
      href: `/dashboard/`,
      icon: Folder,
    },
    {
      name: "Shared Workspaces",
      href: "/shared",
      icon: Share2,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  const handleMouseEnter = useCallback(() => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    const timeout = setTimeout(() => {
      setIsHovered(true);
    }, HOVER_DELAY);
    setHoverTimeout(timeout);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    const timeout = setTimeout(() => {
      if (!isDropdownOpen) {
        setIsHovered(false);
      }
    }, HOVER_DELAY);
    setHoverTimeout(timeout);
  }, [isDropdownOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  return (
    <div
      className={`fixed left-0 top-0 h-screen transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ zIndex: isDropdownOpen ? 100 : 40 }}
    >
      <Card className="h-full">
        <div className="flex h-full flex-col justify-between p-3">
          {/* Top Navigation Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-4">
              <DropdownMenu onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto"
                    aria-label="Sidebar control options"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-48"
                  style={{ zIndex: 101 }}
                >
                  <DropdownMenuRadioGroup
                    value={sidebarState}
                    onValueChange={(value) =>
                      setSidebarState(value as SidebarState)
                    }
                  >
                    <DropdownMenuRadioItem value="expanded">
                      <div className="flex items-center justify-between w-full">
                        <span>Expanded</span>
                        {sidebarState === "expanded" && (
                          <Check className="h-4 w-4 ml-2" />
                        )}
                      </div>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="collapsed">
                      <div className="flex items-center justify-between w-full">
                        <span>Collapsed</span>
                        {sidebarState === "collapsed" && (
                          <Check className="h-4 w-4 ml-2" />
                        )}
                      </div>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="hover">
                      <div className="flex items-center justify-between w-full">
                        <span>Expand on hover</span>
                        {sidebarState === "hover" && (
                          <Check className="h-4 w-4 ml-2" />
                        )}
                      </div>
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 rounded-lg px-3 py-2 transition-colors hover:bg-accent ${
                      isActive ? "bg-accent" : ""
                    }`}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span
                      className={`transition-opacity duration-300 ${
                        isCollapsed ? "opacity-0 w-0" : "opacity-100"
                      }`}
                    >
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Profile Section */}
          <div className="mt-auto pt-4">
            <DropdownMenu onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`w-full justify-start space-x-2 ${
                    isCollapsed ? "justify-center" : ""
                  }`}
                >
                  <div className="h-6 w-6 rounded-full bg-primary flex-shrink-0" />
                  <div
                    className={`flex flex-col items-start text-sm transition-opacity duration-300 ${
                      isCollapsed ? "opacity-0 w-0" : "opacity-100"
                    }`}
                  >
                    <span className="font-medium">
                      {user?.user_metadata.name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {user?.email || "Not signed in"}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[200px]"
                style={{ zIndex: 101 }}
              >
                <DropdownMenuItem
                  className="p-0"
                  onSelect={(e) => e.preventDefault()}
                >
                  <ThemeSwitcher
                    className="w-full justify-start px-2"
                    contentClassName="z-[9999]"
                  />
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile" className="w-full">
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500 cursor-pointer"
                  onClick={signOutAction}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Sidebar;
