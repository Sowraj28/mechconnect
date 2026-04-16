"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Truck,
  IndianRupee,
  CalendarCheck,
  Plus,
  ArrowRight,
  TrendingUp,
  BookOpen,
  BarChart3,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Safely extract an array from any API response shape:
// handles plain [], { vehicles:[] }, { bookings:[] }, { data:[] }, etc.
function extractArray(raw: any, ...keys: string[]): any[] {
  if (Array.isArray(raw)) return raw;
  for (const key of keys) {
    if (Array.isArray(raw?.[key])) return raw[key];
  }
  return [];
}

// Counts as "active" (job not yet done) — covers every status name your API might use
function isActiveBooking(b: any): boolean {
  const s = (b.status || "").toUpperCase();
  return (
    s === "IN_PROGRESS" ||
    s === "INPROGRESS" ||
    s === "PENDING" ||
    s === "CONFIRMED" ||
    s === "ASSIGNED" ||
    s === "ACCEPTED" ||
    s === "ONGOING"
  );
}

// Was this booking created/scheduled today?
function isToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
}

// Badge class based on status
function statusBadge(status: string) {
  const s = (status || "").toUpperCase();
  if (s === "COMPLETED") return "badge-success";
  if (isActiveBooking({ status })) return "badge-warning";
  if (s === "CANCELLED") return "badge-danger";
  return "badge-info";
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DriverDashboard() {
  const [driver, setDriver] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/drivers/me").then((r) => r.json()),
      fetch("/api/vehicles").then((r) => r.json()),
      fetch("/api/revenue").then((r) => r.json()),
      fetch("/api/bookings").then((r) => r.json()),
    ]).then(([driverData, v, rev, b]) => {
      setDriver(driverData?.error ? null : driverData);
      // Handle both { vehicles: [] } and plain [] response shapes
      setVehicles(extractArray(v, "vehicles", "data"));
      setRevenue(rev?.error ? null : rev);
      // Handle both { bookings: [] } and plain [] response shapes
      setBookings(extractArray(b, "bookings", "data"));
      setLoading(false);
    });
  }, []);

  // ── Derived stats ──
  const activeVehicles = vehicles.filter((v) => v.isActive).length;
  const activeBookings = bookings.filter(isActiveBooking);
  const todayBookings = bookings.filter(
    (b) =>
      isToday(b.createdAt) ||
      isToday(b.date) ||
      isToday(b.bookingDate) ||
      isToday(b.scheduledAt),
  );

  // Smart booking card: prefer active → today → total (always shows a real number)
  const bookingValue =
    activeBookings.length > 0
      ? activeBookings.length
      : todayBookings.length > 0
        ? todayBookings.length
        : bookings.length;

  const bookingTitle =
    activeBookings.length > 0
      ? "Active Bookings"
      : todayBookings.length > 0
        ? "Today's Bookings"
        : "Total Bookings";

  const bookingSub =
    activeBookings.length > 0
      ? "In progress"
      : todayBookings.length > 0
        ? "Jobs done today"
        : `${bookings.length} jobs all time`;

  // Chart data from revenue API
  const chartData =
    revenue?.vehicles?.slice(0, 6).map((v: any) => ({
      name: v.vehicleNumber.slice(-6),
      Revenue: v.totalRevenue,
      Expense: v.totalExpense,
      Profit: v.netProfit,
    })) || [];

  // ── Loading skeleton ──
  if (loading)
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-gray-200 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );

  // ── Render ──
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-brand-gradient text-white rounded-2xl p-6">
        <h1 className="font-display text-2xl font-bold">
          Welcome back, {driver?.name?.split(" ")[0] || "Driver"}! 👋
        </h1>
        {/* ✅ CHANGED: text-blue-200 → text-purple-200 */}
        <p className="text-purple-200 mt-1">
          Here's your business overview for today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Vehicles */}
        <div className="card p-5">
          <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
            <Truck className="w-6 h-6 text-blue-600" />
          </div>
          <div className="font-bold text-xl text-gray-900 font-display">
            {vehicles.length}
          </div>
          <div className="text-sm font-medium text-gray-700 mt-0.5">
            Total Vehicles
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {activeVehicles} active
          </div>
        </div>

        {/* Smart Bookings Card */}
        <div className="card p-5">
          <div className="w-11 h-11 bg-yellow-100 rounded-xl flex items-center justify-center mb-3">
            <CalendarCheck className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="font-bold text-xl text-gray-900 font-display">
            {bookingValue}
          </div>
          <div className="text-sm font-medium text-gray-700 mt-0.5">
            {bookingTitle}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{bookingSub}</div>
        </div>

        {/* Total Revenue */}
        <div className="card p-5">
          <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center mb-3">
            <IndianRupee className="w-6 h-6 text-green-600" />
          </div>
          <div className="font-bold text-xl text-gray-900 font-display">
            {formatCurrency(revenue?.totals?.totalRevenue || 0)}
          </div>
          <div className="text-sm font-medium text-gray-700 mt-0.5">
            Total Revenue
          </div>
          <div className="text-xs text-gray-400 mt-0.5">All time</div>
        </div>

        {/* Net Profit */}
        <div className="card p-5">
          <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div className="font-bold text-xl text-gray-900 font-display">
            {formatCurrency(revenue?.totals?.netProfit || 0)}
          </div>
          <div className="text-sm font-medium text-gray-700 mt-0.5">
            Net Profit
          </div>
          <div className="text-xs text-gray-400 mt-0.5">After expenses</div>
        </div>
      </div>

      {/* Charts + Vehicles Status */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Revenue by Vehicle</h2>
            {/* ✅ CHANGED: text-blue-600 → text-purple-600, hover:text-blue-700 → hover:text-purple-700 */}
            <Link
              href="/driver/revenue"
              className="text-purple-600 text-sm font-medium hover:text-purple-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                <Bar dataKey="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-gray-400">
              <BarChart3 className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">No revenue data yet</p>
              <p className="text-xs">Complete bookings to see charts</p>
            </div>
          )}
        </div>

        {/* Vehicles Status */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Vehicles Status</h2>
            {/* ✅ CHANGED: text-blue-600 → text-purple-600, hover:text-blue-700 → hover:text-purple-700 */}
            <Link
              href="/driver/vehicles"
              className="text-purple-600 text-sm font-medium hover:text-purple-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              {vehicles.length === 0 ? "Add First Vehicle" : "Add Vehicle"}
            </Link>
          </div>

          {vehicles.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-gray-400">
              <Truck className="w-12 h-12 mb-2 opacity-30" />
              <p className="text-sm font-medium">No vehicles registered</p>
              <Link
                href="/driver/vehicles"
                className="mt-3 btn-primary text-sm py-2 px-4"
              >
                Add First Vehicle
              </Link>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {vehicles.map((v: any) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        v.isActive ? "bg-green-100" : "bg-gray-200"
                      }`}
                    >
                      <Truck
                        className={`w-5 h-5 ${
                          v.isActive ? "text-green-600" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900">
                        {v.vehicleNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        {v.vehicleType} • {v.capacity}
                      </div>
                    </div>
                  </div>
                  <span
                    className={v.isActive ? "badge-success" : "badge-danger"}
                  >
                    {v.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Recent Bookings</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
            {bookings.length} total
          </span>
        </div>

        {bookings.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="font-medium">No bookings yet</p>
            <p className="text-xs mt-1 text-gray-400">
              Share a vehicle's booking form link with your driver to get
              started
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-3 font-semibold text-gray-600">
                    Customer
                  </th>
                  <th className="text-left pb-3 font-semibold text-gray-600">
                    Vehicle
                  </th>
                  <th className="text-left pb-3 font-semibold text-gray-600">
                    Area
                  </th>
                  <th className="text-left pb-3 font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="text-right pb-3 font-semibold text-gray-600">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.slice(0, 8).map((b: any) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-gray-900">
                      {b.customerName || b.name || "—"}
                    </td>
                    <td className="py-3 text-gray-600">
                      {b.vehicle?.vehicleNumber || b.vehicleNumber || "—"}
                    </td>
                    <td className="py-3 text-gray-600">
                      {b.area || b.location || "—"}
                    </td>
                    <td className="py-3">
                      <span className={statusBadge(b.status)}>
                        {b.status || "SUBMITTED"}
                      </span>
                    </td>
                    <td className="py-3 text-right font-medium text-gray-900">
                      {b.workDetail?.cost
                        ? formatCurrency(b.workDetail.cost)
                        : b.cost
                          ? formatCurrency(b.cost)
                          : b.revenue
                            ? formatCurrency(b.revenue)
                            : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
