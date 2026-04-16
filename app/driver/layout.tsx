"use client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import {
  LayoutDashboard,
  Truck,
  BarChart3,
  Star,
  CreditCard,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Wrench,
  ChevronRight,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/driver/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/driver/vehicles", icon: Truck, label: "My Vehicles" },
  { href: "/driver/revenue", icon: BarChart3, label: "Revenue" },
  { href: "/driver/reviews", icon: Star, label: "Reviews" },
  { href: "/driver/payments", icon: CreditCard, label: "Payments" },
  { href: "/driver/settings", icon: Settings, label: "Settings" },
];

const LS_KEY = "driver_notif_seen_at";

function getSeenAt(): number {
  try {
    return parseInt(localStorage.getItem(LS_KEY) || "0", 10);
  } catch {
    return 0;
  }
}
function saveSeenAt(ts: number) {
  try {
    localStorage.setItem(LS_KEY, String(ts));
  } catch {}
}

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [driver, setDriver] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [unreadBadge, setUnreadBadge] = useState(0);
  const initializedRef = useRef(false);

  const isAuthPage =
    pathname === "/driver/login" ||
    pathname === "/driver/register" ||
    pathname.startsWith("/driver/booking-form");

  useEffect(() => {
    if (isAuthPage) {
      setChecking(false);
      return;
    }
    fetch("/api/drivers/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          router.push("/driver/login");
        } else {
          setDriver(d);
          setChecking(false);
        }
      })
      .catch(() => router.push("/driver/login"));
  }, [pathname, isAuthPage, router]);

  useEffect(() => {
    if (!driver) return;
    function calcBadge(list: any[]) {
      const seenAt = getSeenAt();
      const newCount = list.filter(
        (n: any) => new Date(n.createdAt).getTime() > seenAt,
      ).length;
      setUnreadBadge(newCount);
    }
    function fetchNotifications() {
      fetch("/api/notifications")
        .then((r) => r.json())
        .then((data) => {
          const list = Array.isArray(data) ? data : [];
          setNotifications(list);
          if (!initializedRef.current) {
            initializedRef.current = true;
            if (getSeenAt() === 0 && list.length > 0) {
              saveSeenAt(Date.now());
              setUnreadBadge(0);
              return;
            }
          }
          calcBadge(list);
        });
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [driver]);

  function handleBellClick() {
    const opening = !notifOpen;
    setNotifOpen(opening);
    if (opening) {
      saveSeenAt(Date.now());
      setUnreadBadge(0);
    }
  }

  useEffect(() => {
    if (!notifOpen) return;
    function handleClick(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest("[data-notif-dropdown]"))
        setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);

  if (isAuthPage) return <>{children}</>;

  if (checking)
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-purple-600 font-medium">Loading...</p>
        </div>
      </div>
    );

  async function handleLogout() {
    try {
      localStorage.removeItem(LS_KEY);
    } catch {}
    await fetch("/api/drivers/auth/logout", { method: "POST" });
    window.location.replace("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-30 transform transition-transform duration-300 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-base text-gray-900">
                Mech<span className="text-purple-600">Connect</span>
              </div>
              <div className="text-xs text-gray-500">Operator Portal</div>
            </div>
          </Link>
        </div>

        <div className="p-4 mx-4 mt-4 bg-purple-50 rounded-xl border border-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {driver?.name?.charAt(0) || "O"}
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">
                {driver?.name}
              </div>
              <div className="text-xs text-gray-500 truncate max-w-[130px]">
                {driver?.email}
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-2">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-sm",
                pathname === href || pathname.startsWith(href + "/")
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:bg-gray-100",
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
              {pathname === href && (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </button>
              <h1 className="font-bold text-gray-900 text-lg hidden sm:block">
                {NAV.find(
                  (n) =>
                    pathname === n.href || pathname.startsWith(n.href + "/"),
                )?.label || "Dashboard"}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative" data-notif-dropdown>
                <button
                  onClick={handleBellClick}
                  className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {unreadBadge > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
                      {unreadBadge > 9 ? "9+" : unreadBadge}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">
                          Notifications
                        </h3>
                        {notifications.filter((n) => !n.isRead).length > 0 && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                            {notifications.filter((n) => !n.isRead).length}{" "}
                            unread
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-400 text-sm">
                          No notifications
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n.id}
                            className={cn(
                              "p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors",
                              !n.isRead && "bg-purple-50/50",
                            )}
                          >
                            <div className="font-semibold text-sm text-gray-900">
                              {n.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {n.message}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(n.createdAt).toLocaleDateString(
                                "en-IN",
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-100">
                <User className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">
                  {driver?.name?.split(" ")[0]}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
