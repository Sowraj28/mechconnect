"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Wrench, Search, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const CITIES = [
  "All",
  "Chennai",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Coimbatore",
  "Pune",
  "Kolkata",
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    if (
      status === "authenticated" &&
      (session.user as any).userType === "driver"
    ) {
      router.push("/driver/dashboard");
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-brand-gradient rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-gray-900">
                Mech<span className="text-purple-600">Connect</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/user/search"
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname.includes("/search")
                    ? "text-purple-600"
                    : "text-gray-600 hover:text-purple-600",
                )}
              >
                Find Services
              </Link>
              {session ? (
                <>
                  <Link
                    href="/user/dashboard"
                    className={cn(
                      "text-sm font-medium transition-colors",
                      pathname.includes("/dashboard")
                        ? "text-purple-600"
                        : "text-gray-600 hover:text-purple-600",
                    )}
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {session.user?.name?.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {session.user?.name?.split(" ")[0]}
                    </span>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="btn-secondary text-sm py-2 px-4"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="btn-primary text-sm py-2 px-4"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            <button
              className="md:hidden"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              {mobileMenu ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-2">
            <Link
              href="/user/search"
              className="block py-2 text-gray-700 font-medium"
              onClick={() => setMobileMenu(false)}
            >
              Find Services
            </Link>
            {session ? (
              <>
                <Link
                  href="/user/dashboard"
                  className="block py-2 text-gray-700 font-medium"
                  onClick={() => setMobileMenu(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block py-2 text-red-600 font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block py-2 text-purple-600 font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="block py-2 text-purple-600 font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      <div className="bg-white border-b border-gray-100 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 py-2 whitespace-nowrap">
            {CITIES.map((city) => (
              <Link
                key={city}
                href={`/user/search?city=${city === "All" ? "" : city}`}
                className="px-3 py-1.5 text-sm text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors font-medium"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <main>{children}</main>

      <footer className="bg-gray-900 text-gray-400 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Wrench className="w-5 h-5 text-purple-400" />
            <span className="font-display font-bold text-white">
              MechConnect
            </span>
          </div>
          <p className="text-sm">
            © 2024 MechConnect. India's Heavy Haulage Service Platform.
          </p>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <a href="#" className="hover:text-white transition-colors">
              About
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
            <Link
              href="/driver/login"
              className="hover:text-white transition-colors"
            >
              Driver Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
