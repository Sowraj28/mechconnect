"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { Search, Star, Phone, ArrowRight } from "lucide-react";

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  if (status === "loading")
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="bg-brand-gradient text-white rounded-2xl p-8 mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">
          Welcome, {session?.user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-purple-200">
          Find and book Heavy Haulage services near you
        </p>
        <Link
          href="/user/search"
          className="inline-flex items-center gap-2 mt-4 bg-white text-purple-700 font-bold px-6 py-3 rounded-xl hover:bg-purple-50 transition-colors"
        >
          <Search className="w-5 h-5" /> Find Services Now
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            icon: Search,
            title: "Find Services",
            desc: "Search operators near you",
            href: "/user/search",
            color: "purple",
            bg: "bg-purple-100",
          },
          {
            icon: Phone,
            title: "Call Operators",
            desc: "Login to contact directly",
            href: "/user/search",
            color: "green",
            bg: "bg-green-100",
          },
          {
            icon: Star,
            title: "Write Reviews",
            desc: "Rate your experience",
            href: "/user/search",
            color: "yellow",
            bg: "bg-yellow-100",
          },
        ].map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="card p-6 hover:shadow-card-hover transition-all duration-300 group"
          >
            <div
              className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
            >
              <item.icon className={`w-6 h-6 text-${item.color}-600`} />
            </div>
            <h3 className="font-bold text-gray-900">{item.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
            <ArrowRight className="w-4 h-4 text-gray-400 mt-2 group-hover:text-purple-600 transition-colors" />
          </Link>
        ))}
      </div>

      {/* Tips */}
      <div className="card p-6">
        <h2 className="font-display font-bold text-lg text-gray-900 mb-4">
          How to use MechConnect
        </h2>
        <div className="space-y-3">
          {[
            {
              step: "1",
              text: "Search for heavy haulage services in your city using the search bar",
            },
            {
              step: "2",
              text: "Browse verified operator profiles with photos, vehicles, and reviews",
            },
            {
              step: "3",
              text: "Call or WhatsApp operators directly (requires login)",
            },
            {
              step: "4",
              text: "After service, leave a review to help other customers",
            },
          ].map((tip) => (
            <div key={tip.step} className="flex items-start gap-3">
              <div className="w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {tip.step}
              </div>
              <p className="text-gray-600 text-sm pt-0.5">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
