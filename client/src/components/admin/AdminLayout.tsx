import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  LogOut,
  KeyRound,
  Shield,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getAdminSession, clearAdminSession } from "@/lib/auth";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Change Password", url: "/admin/change-password", icon: KeyRound },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const adminSession = getAdminSession();

  useEffect(() => {
    if (!adminSession) {
      setLocation("/admin/login");
    }
  }, [adminSession, setLocation]);

  const handleLogout = () => {
    clearAdminSession();
    setLocation("/admin/login");
  };

  if (!adminSession) {
    return null;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex min-h-screen w-full bg-slate-900">
        <Sidebar className="border-r border-slate-700 bg-slate-800">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-white">
                  <span className="text-primary">ST</span> Admin
                </h2>
                <p className="text-xs text-slate-400">{adminSession.username}</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-2">
            <SidebarGroup>
              <SidebarGroupLabel className="text-slate-400 text-xs uppercase tracking-wider px-2">
                Management
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild
                        isActive={location === item.url}
                        className="text-slate-300 hover:text-white hover:bg-slate-700 data-[active=true]:bg-primary/20 data-[active=true]:text-primary"
                      >
                        <Link href={item.url}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-slate-700">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-700"
              onClick={handleLogout}
              data-testid="button-admin-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex flex-col flex-1">
          <header className="flex items-center gap-4 h-14 px-4 border-b border-slate-700 bg-slate-800">
            <SidebarTrigger className="text-slate-400 hover:text-white" data-testid="button-admin-sidebar-toggle">
              <Menu className="w-5 h-5" />
            </SidebarTrigger>
            <div className="flex-1" />
            <Link href="/">
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:text-white">
                View Store
              </Button>
            </Link>
          </header>
          <main className="flex-1 overflow-auto bg-slate-900 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
