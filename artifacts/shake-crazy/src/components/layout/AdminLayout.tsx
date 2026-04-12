import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { getAuthToken, clearAuthToken } from "@/lib/auth";
import { LayoutDashboard, Utensils, TicketPercent, Camera, Trophy, MapPin, LogOut, BarChart3 } from "lucide-react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!getAuthToken()) {
      setLocation("/admin/login");
    }
  }, [location, setLocation]);

  const handleLogout = () => {
    clearAuthToken();
    setLocation("/admin/login");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Utensils, label: "Menu", href: "/admin/menu" },
    { icon: TicketPercent, label: "Discounts", href: "/admin/discounts" },
    { icon: Camera, label: "Submissions", href: "/admin/submissions" },
    { icon: Trophy, label: "Winners", href: "/admin/winners" },
    { icon: MapPin, label: "Location", href: "/admin/location" },
    { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      <aside className="w-64 bg-foreground text-background flex flex-col shadow-2xl z-10 shrink-0">
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="font-display text-xl text-white pt-1">SC</span>
            </div>
            <span className="font-display text-2xl tracking-widest text-white">ADMIN</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-background/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-background/70 hover:bg-destructive hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 h-screen overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
