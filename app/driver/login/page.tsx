"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Truck, Mail, Lock, Eye, EyeOff, Wrench } from "lucide-react";
import toast from "react-hot-toast";

export default function DriverLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/drivers/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Welcome to Operator Dashboard!");
        window.location.replace("/driver/dashboard");
      } else {
        toast.error(data.error || "Invalid credentials");
      }
    } catch (err) {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <Wrench className="w-7 h-7 text-purple-700" />
            </div>
            <span className="font-display font-bold text-2xl text-white">
              Mech<span className="text-yellow-400">Connect</span>
            </span>
          </Link>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Truck className="w-9 h-9 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">
            Operator Portal
          </h1>
          <p className="text-purple-200 mt-1">
            Sign in to manage your vehicles & bookings
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-purple-100 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-purple-100 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-white/10 border border-white/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300"
                >
                  {showPwd ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="animate-spin w-5 h-5 border-2 border-purple-900 border-t-transparent rounded-full" />
              )}
              {loading ? "Signing in..." : "Sign In to Dashboard"}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-purple-200">
            New operator?{" "}
            <Link
              href="/driver/register"
              className="text-yellow-400 font-semibold"
            >
              Register your vehicle
            </Link>
          </div>
          <div className="mt-2 text-center text-sm text-purple-200">
            Customer?{" "}
            <Link href="/auth/login" className="text-white font-semibold">
              User Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
