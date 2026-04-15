"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Plus, User, LogOut, Sparkles, PanelLeftClose, PanelLeft } from "lucide-react";
import { cn, getInitials, generateAvatarColor } from "@/lib/utils";
import { signOut, useSession } from "@/lib/auth/client";
import { ThemeToggle } from "./ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/notes/new", icon: Plus, label: "New Note" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = React.useState(false);

  const handleSignOut = async () => {
    await signOut({ fetchOptions: { onSuccess: () => { router.push("/auth/login"); toast.success("Signed out"); } } });
  };

  const user = session?.user;
  const initials = user?.name ? getInitials(user.name) : "?";
  const avatarBg = user?.name ? generateAvatarColor(user.name) : "bg-amber-500";

  return (
    <aside className={cn("relative flex flex-col h-screen border-r bg-card transition-all duration-300", collapsed ? "w-[64px]" : "w-[240px]")}>
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-amber-950" />
          </div>
          {!collapsed && <span className="font-semibold text-sm tracking-tight">NoteAI</span>}
        </div>
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] z-10 h-6 w-6 rounded-full border bg-background shadow-sm flex items-center justify-center hover:bg-muted transition-colors"
      >
        {collapsed ? <PanelLeft className="h-3 w-3" /> : <PanelLeftClose className="h-3 w-3" />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
                "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                active && "bg-amber-50 text-amber-900 font-medium dark:bg-amber-900/20 dark:text-amber-300",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className={cn("p-3 border-t space-y-2", collapsed && "flex flex-col items-center")}>
        <ThemeToggle />
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn("w-full flex items-center gap-2.5 rounded-lg p-2 hover:bg-muted/60 transition-colors text-left", collapsed && "justify-center")}>
                <Avatar className="h-7 w-7 shrink-0">
                  {user.image && <AvatarImage src={user.image} alt={user.name} />}
                  <AvatarFallback className={cn("text-xs text-white", avatarBg)}>{initials}</AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-52">
              <DropdownMenuLabel className="font-normal">
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile"><User className="h-4 w-4" />Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </aside>
  );
}