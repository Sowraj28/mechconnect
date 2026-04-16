"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Phone,
  Star,
  Shield,
  Clock,
  ChevronRight,
  Truck,
  Wrench,
  Award,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

const CITIES = [
  "Chennai",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Coimbatore",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
];

export default function HomePage() {
  const [searchCity, setSearchCity] = useState("");
  const [searchService, setSearchService] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!session) {
      toast("Please login or create an account to search services", {
        icon: "🔒",
        duration: 3000,
        style: { fontWeight: "500" },
      });
      router.push("/auth/login");
      return;
    }
    const city = searchCity || "All";
    router.push(
      `/user/search?city=${encodeURIComponent(city)}&service=${encodeURIComponent(searchService)}`,
    );
  }

  function handlePopularSearch(s: string) {
    if (!session) {
      toast("Please login to search services", { icon: "🔒" });
      router.push("/auth/login");
      return;
    }
    setSearchService(s);
  }

  const NavAuth = () => (
    <>
      <Link href="/auth/login" className="btn-secondary text-sm py-2 px-4">
        User Login
      </Link>
      <Link href="/driver/login" className="btn-primary text-sm py-2 px-4">
        Operator Login
      </Link>
    </>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-xl text-gray-900">
                  Mech<span className="text-purple-600">Connect</span>
                </span>
                <p className="text-xs text-gray-500 -mt-1">
                  India's #1 Heavy Vehicle Booking Platform
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-purple-600 font-medium text-sm transition-colors"
              >
                Home
              </Link>
              <Link
                href="/user/search"
                className="text-gray-600 hover:text-purple-600 font-medium text-sm transition-colors"
              >
                Find Vehicles
              </Link>
              <NavAuth />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-brand-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              500+ Verified Operators Across India
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Book Trusted Heavy Vehicles &<br />
              <span className="text-yellow-400">Equipment Operators</span> Near
              You
            </h1>
            <p className="text-purple-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Connect with verified JCB, Crane, Loader, Tipper, Sewage Truck
              operators near you. Fast, reliable, and affordable service at your
              doorstep.
            </p>

            {/* Search Box */}
            <form
              onSubmit={handleSearch}
              className="bg-white rounded-2xl p-3 shadow-2xl max-w-3xl mx-auto"
            >
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search JCB, Crane, Loader, Tipper, Sewage..."
                    value={searchService}
                    onChange={(e) => setSearchService(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-sm"
                  />
                </div>
                <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
                  <MapPin className="w-5 h-5 text-purple-500" />
                  <select
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-gray-800 text-sm"
                  >
                    <option value="">Select City</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 whitespace-nowrap disabled:opacity-70"
                >
                  <Search className="w-4 h-4" />
                  {session ? "Search" : "Login to Search"}
                </button>
              </div>

              {!session && status !== "loading" && (
                <div className="mt-2 px-2 flex items-center justify-center gap-2 text-xs text-gray-400">
                  <Shield className="w-3.5 h-3.5" />
                  <span>
                    <Link
                      href="/auth/login"
                      className="text-purple-600 font-semibold hover:underline"
                    >
                      Login
                    </Link>{" "}
                    or{" "}
                    <Link
                      href="/auth/register"
                      className="text-purple-600 font-semibold hover:underline"
                    >
                      Create account
                    </Link>{" "}
                    to search and contact operators
                  </span>
                </div>
              )}
            </form>

            {/* Popular searches */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              <span className="text-purple-200 text-sm">Popular:</span>
              {[
                "JCB Excavator",
                "Mobile Crane",
                "Tipper Truck",
                "Sewage Tanker",
                "Loader",
                "Compactor",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => handlePopularSearch(s)}
                  className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-full transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div
          className="h-16 bg-gray-50"
          style={{ clipPath: "ellipse(100% 100% at 50% 100%)" }}
        ></div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: Truck,
                value: "500+",
                label: "Verified Operators",
                color: "purple",
                bg: "bg-purple-100",
              },
              {
                icon: Users,
                value: "10K+",
                label: "Happy Customers",
                color: "green",
                bg: "bg-green-100",
              },
              {
                icon: MapPin,
                value: "50+",
                label: "Cities Covered",
                color: "purple",
                bg: "bg-purple-100",
              },
              {
                icon: Award,
                value: "4.8★",
                label: "Average Rating",
                color: "yellow",
                bg: "bg-yellow-100",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="card p-6 text-center hover:shadow-card-hover transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-3`}
                >
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div className="text-2xl font-bold font-display text-gray-900">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-3">
              How MechConnect Works
            </h2>
            <p className="text-gray-500 text-lg">
              Simple 3 steps to book your vehicle
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Search,
                title: "Search & Browse",
                desc: "Search for JCB, Crane, Loader, Tipper or any heavy vehicle in your city. Browse verified operator profiles with photos, reviews, and service details.",
              },
              {
                step: "02",
                icon: Phone,
                title: "Call or Message",
                desc: "After login, directly call or message the operator. Login to access contact details and confirm your booking.",
              },
              {
                step: "03",
                icon: Star,
                title: "Get Work Done & Review",
                desc: "Get your job done by verified professionals. Share your feedback to help others choose the best operator.",
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center group">
                <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-700 transition-colors duration-300 shadow-lg">
                  <item.icon className="w-9 h-9 text-white" />
                </div>
                <div className="absolute top-0 right-1/2 transform translate-x-12 -translate-y-2 text-7xl font-bold text-purple-50 font-display select-none">
                  {item.step}
                </div>
                <h3 className="font-display font-bold text-xl text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-3">
              Vehicles & Equipment We Cover
            </h2>
            <p className="text-gray-500 text-lg">
              All types of heavy vehicles available on one platform
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: "JCB / Excavator", emoji: "🚜" },
              { label: "Mobile Crane", emoji: "🏗️" },
              { label: "Tipper Truck", emoji: "🚛" },
              { label: "Sewage Tanker", emoji: "🚰" },
              { label: "Loader", emoji: "⚙️" },
              { label: "Compactor", emoji: "🔩" },
              { label: "Tower Crane", emoji: "🏗️" },
              { label: "Concrete Mixer", emoji: "🪣" },
              { label: "Hydra Crane", emoji: "🏗️" },
              { label: "Tractor", emoji: "🚜" },
              { label: "Bulldozer", emoji: "🚧" },
              { label: "Water Tanker", emoji: "💧" },
            ].map((v) => (
              <button
                key={v.label}
                onClick={() => handlePopularSearch(v.label)}
                className="card p-4 text-center hover:shadow-card-hover hover:border-purple-200 transition-all duration-300 group"
              >
                <div className="text-3xl mb-2">{v.emoji}</div>
                <div className="text-xs font-semibold text-gray-700 group-hover:text-purple-600 transition-colors">
                  {v.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for Operators */}
      <section className="py-16 bg-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-gradient rounded-3xl p-10 md:p-16 text-white text-center">
            <Truck className="w-16 h-16 text-white/80 mx-auto mb-6" />
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Are You a Heavy Vehicle Operator?
            </h2>
            <p className="text-purple-100 text-lg mb-8 max-w-2xl mx-auto">
              Register your JCB, Crane, Tipper, or any heavy vehicle on
              MechConnect and get connected with thousands of customers in your
              city.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/driver/register"
                className="bg-white text-purple-700 hover:bg-purple-50 font-bold px-8 py-3.5 rounded-xl transition-all duration-200 inline-flex items-center gap-2"
              >
                Register Your Vehicle <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                href="/driver/login"
                className="bg-white/20 hover:bg-white/30 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 border border-white/40"
              >
                Operator Login
              </Link>
            </div>
            <div className="flex items-center justify-center gap-8 mt-8 text-sm text-purple-200">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Verified Platform
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Quick Setup
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Rs.99/vehicle/month
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-3">
              Why MechConnect?
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Verified Operators",
                desc: "All operators are verified with proper documentation, vehicle registration, and license details.",
              },
              {
                icon: Star,
                title: "Rated & Reviewed",
                desc: "Real customer reviews to help you choose the best operator for your job.",
              },
              {
                icon: Clock,
                title: "24/7 Availability",
                desc: "Find operators available round the clock for emergency and urgent requirements.",
              },
              {
                icon: MapPin,
                title: "Location-Based Search",
                desc: "Find heavy vehicles near your exact location with city-wise filtering.",
              },
              {
                icon: Phone,
                title: "Direct Contact",
                desc: "Call or WhatsApp operators directly without any middleman or commission.",
              },
              {
                icon: Award,
                title: "Best Prices",
                desc: "Competitive pricing with transparent cost breakdown. No hidden charges.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="card p-6 hover:shadow-card-hover transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors duration-300">
                  <feature.icon className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-bold text-white text-lg">
                  MechConnect
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                India's most trusted platform for booking JCB, Crane, Tipper,
                Loader, and all heavy vehicles.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">For Users</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/user/search"
                    className="hover:text-white transition-colors"
                  >
                    Find Vehicles
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/login"
                    className="hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/register"
                    className="hover:text-white transition-colors"
                  >
                    Register
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">For Operators</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/driver/register"
                    className="hover:text-white transition-colors"
                  >
                    Register Vehicle
                  </Link>
                </li>
                <li>
                  <Link
                    href="/driver/login"
                    className="hover:text-white transition-colors"
                  >
                    Operator Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/driver/dashboard"
                    className="hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm">© 2024 MechConnect. All rights reserved.</p>
            <p className="text-sm mt-2 md:mt-0">Made with love in India 🇮🇳</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
