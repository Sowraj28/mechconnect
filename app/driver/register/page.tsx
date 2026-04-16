"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wrench, Mail, Lock, User, Phone, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import { INDIAN_STATES } from "@/lib/utils";

export default function DriverRegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    orgName: "",
    orgType: "INDIVIDUAL",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const set =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/drivers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      toast.success("Registered! Please login.");
      router.push("/driver/login");
    } else toast.error(data.error || "Failed");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <Wrench className="w-6 h-6 text-purple-700" />
            </div>
            <span className="font-display font-bold text-xl text-white">
              Mech<span className="text-yellow-400">Connect</span>
            </span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-white">
            Register as Operator
          </h1>
          <p className="text-purple-200 mt-1">
            Join 500+ operators on MechConnect
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-purple-100 mb-1.5">
                  Account Type
                </label>
                <select
                  value={form.orgType}
                  onChange={set("orgType")}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value="INDIVIDUAL" className="text-gray-900">
                    Individual Operator
                  </option>
                  <option value="ORGANIZATION" className="text-gray-900">
                    Organization / Company
                  </option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-purple-100 mb-1.5">
                  {form.orgType === "ORGANIZATION" ? "Owner Name" : "Full Name"}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={set("name")}
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="John Kumar"
                  />
                </div>
              </div>
              {form.orgType === "ORGANIZATION" && (
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-purple-100 mb-1.5">
                    Organization Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
                    <input
                      type="text"
                      value={form.orgName}
                      onChange={set("orgName")}
                      className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Kumar Heavy Haulage Services"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-purple-100 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-purple-100 mb-1.5">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={set("phone")}
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="9876543210"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-purple-100 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={set("city")}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Chennai"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-purple-100 mb-1.5">
                  State
                </label>
                <select
                  value={form.state}
                  onChange={set("state")}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value="" className="text-gray-900">
                    Select State
                  </option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s} className="text-gray-900">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-purple-100 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={set("password")}
                    required
                    minLength={6}
                    className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Min 6 characters"
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold py-3 rounded-xl transition-all mt-2 flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="animate-spin w-5 h-5 border-2 border-purple-900 border-t-transparent rounded-full"></span>
              )}
              {loading ? "Registering..." : "Register & Start"}
            </button>
          </form>
          <div className="mt-4 text-center text-sm text-purple-200">
            Already registered?{" "}
            <Link
              href="/driver/login"
              className="text-yellow-400 font-semibold"
            >
              Operator Login
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          {[
            ["₹99/month", "per vehicle"],
            ["₹999/year", "per vehicle"],
            ["Free", "to register"],
          ].map(([val, sub]) => (
            <div key={val} className="bg-white/10 rounded-xl p-3">
              <div className="text-yellow-400 font-bold font-display">
                {val}
              </div>
              <div className="text-purple-200 text-xs">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
