import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { LayoutDashboard, LogOut, PanelLeft, Briefcase, Kanban, User, Terminal, Bell } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { useAuth } from "@/_core/hooks/useAuth";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Briefcase, label: "Job Discovery", path: "/jobs" },
  { icon: Kanban, label: "Application Tracker", path: "/tracker" },
  { icon: User, label: "Profile & Resume", path: "/profile" },
  { icon: Terminal, label: "Automation Logs", path: "/logs" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user, logout } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-6">
        <div className="max-w-md w-full bg-card p-8 rounded-3xl border border-border/80 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
            <Briefcase className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Balaji's Career Automation</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to access your intelligent career pipeline, AI match scoring, and automated discovery logs.
            </p>
          </div>
          <Button onClick={() => startLogin()} className="w-full py-6 text-base font-semibold shadow-lg">
            Sign In with Manus
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent logout={logout} user={user}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

function DashboardLayoutContent({
  children,
  logout,
  user,
}: {
  children: React.ReactNode;
  logout: () => void;
  user: any;
}) {
  const [location, setLocation] = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const isMobile = useIsMobile();
  const sidebarRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-border/60 bg-card">
        <SidebarHeader className="h-16 flex items-center px-4 border-b border-border/40">
          <div className="flex items-center gap-3 w-full overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0 shadow-sm">
              BC
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm truncate">Career Automation</span>
                <span className="text-[11px] text-muted-foreground truncate">{user.name || "Your workspace"}</span>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="p-3">
          <SidebarMenu>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => setLocation(item.path)}
                    isActive={isActive}
                    className={`gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
                      isActive ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-3 border-t border-border/40">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-muted transition-all text-left">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                    {user.name?.[0] || "B"}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex flex-col truncate flex-1">
                    <span className="text-xs font-semibold truncate">{user.name || "Account"}</span>
                    <span className="text-[10px] text-muted-foreground truncate">{user.email || "Active Pipeline"}</span>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => logout()} className="text-destructive gap-2 cursor-pointer">
                <LogOut className="w-4 h-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col min-h-screen bg-background">
        <header className="h-16 border-b border-border/40 flex items-center justify-between px-6 bg-card/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border/40">
              Pharma & AI Automation Tracks
            </span>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </SidebarInset>
    </>
  );
}
