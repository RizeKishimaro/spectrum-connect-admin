"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Users,
  Building2,
  Phone,
  Settings,
  CreditCard,
  AlertTriangle,
  Activity,
  Palette,
  LogOut,
  PhoneCall,
  History,
  User,
  PersonStanding,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"


const routes = [
  {
    label: "Dashboard",
    icon: BarChart3,
    href: "/dashboard",
    requireAdmin: true,
  },
  {
    label: "Agents",
    icon: Users,
    href: "/agents",
    requireAdmin: true,
  },
  {
    label: "Call Logs",
    icon: History,
    href: "/call-logs",
  },
  {
    label: "Companies",
    icon: Building2,
    href: "/companies",
    requireAdmin: true,
  },
  {
    label: "SIP Settings",
    icon: Phone,
    href: "/sip-settings",
    requireAdmin: true,
  },
  {
    label: "Subscriptions",
    icon: CreditCard,
    href: "/subscriptions",
    requireAdmin: true,
  },
  {
    label: "IVR Management",
    icon: PhoneCall,
    href: "/ivr-management",
    requireAdmin: true,
  },
  {
    label: "Error Reports",
    icon: AlertTriangle,
    href: "/error-reports",
    requireAdmin: true,
  },
  {
    label: "System Status",
    icon: Activity,
    href: "/system-status",
    requireAdmin: true,
  },
  {
    label: "Manage Users",
    icon: PersonStanding,
    href: "/user-management",
    requireAdmin: true,
  },
  {
    label: "Themes",
    icon: Palette,
    href: "/themes",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];


export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter()

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user")
    router.push("/login")
  }

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : {};

  const filteredRoutes = routes.filter((route) => {
    if (route.requireAdmin && user?.roles !== "admin") return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full w-64 border-r bg-card">
      <div className="p-6">
        <h1 className="text-xl font-bold">Spectrum Connect</h1>
        <p className="text-sm text-muted-foreground">Admin Dashboard</p>
      </div>
      <div className="flex-1 px-3 py-2 space-y-1">
        {filteredRoutes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
              pathname === route.href
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            <route.icon className="h-4 w-4" />
            {route.label}
          </Link>
        ))}
      </div>
      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full justify-start"
          size="sm"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

