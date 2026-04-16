"use client";
import { useEffect, useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  Truck,
  IndianRupee,
  Info,
  CalendarClock,
  BadgeCheck,
  Clock4,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

const MONTHLY_PRICE = 99;
const ANNUAL_PRICE = 999;

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Safely extract array from any API response shape
function extractArray(raw: any, ...keys: string[]): any[] {
  if (Array.isArray(raw)) return raw;
  for (const key of keys) {
    if (Array.isArray(raw?.[key])) return raw[key];
  }
  return [];
}

// How many days until a date
function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Format a date as "15 Mar 2025"
function friendlyDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Next Payment Info Card ────────────────────────────────────────────────────
function NextPaymentBanner({ vehicles }: { vehicles: any[] }) {
  // Find the vehicle with the soonest planEndDate that is active
  const activeWithPlan = vehicles
    .filter((v) => v.planEndDate)
    .sort(
      (a, b) =>
        new Date(a.planEndDate).getTime() - new Date(b.planEndDate).getTime(),
    );

  if (activeWithPlan.length === 0) return null;

  // Group by planEndDate so vehicles expiring same day appear together
  const soonest = activeWithPlan[0];
  const soonestDate = new Date(soonest.planEndDate).toDateString();
  const soonestGroup = activeWithPlan.filter(
    (v) => new Date(v.planEndDate).toDateString() === soonestDate,
  );

  const days = daysUntil(soonest.planEndDate);
  const isExpired = days < 0;
  const isUrgent = days <= 7 && !isExpired;
  const planType = soonest.planType as "MONTHLY" | "ANNUAL";
  const priceEach = planType === "ANNUAL" ? ANNUAL_PRICE : MONTHLY_PRICE;
  const renewTotal = soonestGroup.length * priceEach;

  const bg = isExpired
    ? "bg-red-50 border-red-200"
    : isUrgent
      ? "bg-orange-50 border-orange-200"
      : "bg-blue-50 border-blue-200";
  const icon = isExpired
    ? "text-red-500"
    : isUrgent
      ? "text-orange-500"
      : "text-blue-500";
  const text = isExpired
    ? "text-red-800"
    : isUrgent
      ? "text-orange-800"
      : "text-blue-800";
  const sub = isExpired
    ? "text-red-600"
    : isUrgent
      ? "text-orange-600"
      : "text-blue-600";

  return (
    <div className={`rounded-2xl border p-4 flex items-start gap-4 ${bg}`}>
      <div className={`mt-0.5 ${icon}`}>
        {isExpired ? (
          <AlertCircle className="w-5 h-5" />
        ) : (
          <CalendarClock className="w-5 h-5" />
        )}
      </div>
      <div className="flex-1">
        <p className={`font-semibold text-sm ${text}`}>
          {isExpired
            ? `⚠️ Plan expired for ${soonestGroup.length} vehicle${soonestGroup.length > 1 ? "s" : ""}!`
            : isUrgent
              ? `🔔 Renewal due in ${days} day${days !== 1 ? "s" : ""}!`
              : `📅 Next payment on ${friendlyDate(soonest.planEndDate)}`}
        </p>
        <p className={`text-xs mt-0.5 ${sub}`}>
          {isExpired
            ? `Renew now to keep ${soonestGroup.map((v) => v.vehicleNumber).join(", ")} active.`
            : `${soonestGroup.map((v) => v.vehicleNumber).join(", ")} — ${planType} plan renewal ≈ ${formatCurrency(renewTotal)}`}
        </p>
        {!isExpired && (
          <p className={`text-xs mt-1 font-medium ${sub}`}>
            {days === 0
              ? "Renews today!"
              : `Auto-renewal is manual in demo mode. Come back on ${friendlyDate(soonest.planEndDate)} to renew.`}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Vehicle Plan Badge ────────────────────────────────────────────────────────
function PlanBadge({ vehicle }: { vehicle: any }) {
  if (!vehicle.planEndDate) {
    return (
      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
        No plan
      </span>
    );
  }
  const days = daysUntil(vehicle.planEndDate);
  if (days < 0)
    return (
      <span className="text-xs bg-red-100 text-red-600 font-medium px-2 py-0.5 rounded-full">
        Expired
      </span>
    );
  if (days <= 7)
    return (
      <span className="text-xs bg-orange-100 text-orange-600 font-medium px-2 py-0.5 rounded-full">
        Expires in {days}d
      </span>
    );
  return (
    <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">
      Active · till {friendlyDate(vehicle.planEndDate)}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PaymentsPage() {
  const [data, setData] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<"MONTHLY" | "ANNUAL">(
    "MONTHLY",
  );
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoadingData(true);
    const [payRes, vehRes] = await Promise.all([
      fetch("/api/payments").then((r) => r.json()),
      fetch("/api/vehicles").then((r) => r.json()),
    ]);
    setData(payRes);

    // ✅ Fix: handle { vehicles: [] } OR plain [] response
    const vArr = extractArray(vehRes, "vehicles", "data");
    setVehicles(vArr);
    // Pre-select all vehicles by default
    setSelectedVehicles(vArr.map((v: any) => v.id));
    setLoadingData(false);
  }

  function toggleVehicle(id: string) {
    setSelectedVehicles((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  }

  const pricePerVehicle =
    selectedPlan === "MONTHLY" ? MONTHLY_PRICE : ANNUAL_PRICE;
  const totalAmount = selectedVehicles.length * pricePerVehicle;

  // Next renewal date preview (shown in the pay button area)
  function nextRenewalDate(): string {
    const d = new Date();
    if (selectedPlan === "ANNUAL") d.setFullYear(d.getFullYear() + 1);
    else d.setMonth(d.getMonth() + 1);
    return friendlyDate(d.toISOString());
  }

  async function handlePayment() {
    if (selectedVehicles.length === 0) {
      toast.error("Select at least one vehicle");
      return;
    }
    setProcessing(true);
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planType: selectedPlan,
        vehicleIds: selectedVehicles,
      }),
    });
    const result = await res.json();
    setProcessing(false);
    if (result.success) {
      toast.success(
        `✅ Payment activated! ${selectedVehicles.length} vehicle${selectedVehicles.length > 1 ? "s" : ""} active until ${nextRenewalDate()}.`,
        { duration: 5000 },
      );
      loadData();
    } else {
      toast.error(result.error || "Payment failed");
    }
  }

  if (loadingData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded-2xl" />
          <div className="h-96 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Payments & Subscription</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your vehicle subscription plans
        </p>
      </div>

      {/* Demo Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-yellow-800 text-sm">
            Demo Mode — Payment Bypassed
          </div>
          <div className="text-xs text-yellow-700 mt-0.5">
            In production, Razorpay / PayU will be integrated. Clicking "Pay"
            instantly activates your vehicles in demo mode. Renewal reminders
            will appear here when a plan is about to expire.
          </div>
        </div>
      </div>

      {/* Next Payment Banner */}
      <NextPaymentBanner vehicles={vehicles} />

      {/* Stats row */}
      {vehicles.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              icon: Truck,
              label: "Total Vehicles",
              value: vehicles.length,
              bg: "bg-blue-100",
              ico: "text-blue-600",
            },
            {
              icon: BadgeCheck,
              label: "Active Plans",
              value: vehicles.filter(
                (v) => v.planEndDate && daysUntil(v.planEndDate) >= 0,
              ).length,
              bg: "bg-green-100",
              ico: "text-green-600",
            },
            {
              icon: Clock4,
              label: "Expiring Soon",
              value: vehicles.filter(
                (v) =>
                  v.planEndDate &&
                  daysUntil(v.planEndDate) >= 0 &&
                  daysUntil(v.planEndDate) <= 7,
              ).length,
              bg: "bg-orange-100",
              ico: "text-orange-600",
            },
          ].map((s) => (
            <div key={s.label} className="card p-4">
              <div
                className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-2`}
              >
                <s.icon className={`w-5 h-5 ${s.ico}`} />
              </div>
              <div className="font-bold text-xl text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Left: Payment Setup ── */}
        <div className="card p-6 space-y-5">
          <h2 className="section-title">Subscribe Vehicles</h2>

          {/* Plan Selection */}
          <div>
            <label className="label text-sm font-medium text-gray-700 mb-2 block">
              Select Plan
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  {
                    val: "MONTHLY" as const,
                    price: `₹${MONTHLY_PRICE}`,
                    per: "/vehicle/month",
                    badge: "",
                    desc: "Renews every month",
                  },
                  {
                    val: "ANNUAL" as const,
                    price: `₹${ANNUAL_PRICE}`,
                    per: "/vehicle/year",
                    badge: "Save 15%",
                    desc: "Renews every year",
                  },
                ] as const
              ).map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setSelectedPlan(p.val)}
                  className={`border-2 rounded-xl p-4 text-left transition-all ${
                    selectedPlan === p.val
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-200"
                  }`}
                >
                  <div className="font-bold text-2xl text-gray-900 font-display">
                    {p.price}
                  </div>
                  <div className="text-xs text-gray-500">{p.per}</div>
                  <div className="text-xs text-gray-400 mt-1">{p.desc}</div>
                  {p.badge && (
                    <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full mt-1.5 inline-block">
                      {p.badge}
                    </span>
                  )}
                  {selectedPlan === p.val && (
                    <div className="flex items-center gap-1 mt-2 text-blue-600 text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Select Vehicles{" "}
              <span className="text-gray-400 font-normal">
                ({selectedVehicles.length} of {vehicles.length} selected)
              </span>
            </label>
            {vehicles.length === 0 ? (
              <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Truck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No vehicles found</p>
                <p className="text-xs mt-1">
                  Add vehicles first from the My Vehicles page
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {vehicles.map((v: any) => (
                  <label
                    key={v.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedVehicles.includes(v.id)
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedVehicles.includes(v.id)}
                      onChange={() => toggleVehicle(v.id)}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        v.isActive ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      <Truck
                        className={`w-4 h-4 ${
                          v.isActive ? "text-blue-600" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm">
                        {v.vehicleNumber}
                      </div>
                      <div className="text-xs text-gray-400">
                        {v.vehicleType} • {v.capacity}
                      </div>
                    </div>
                    {/* Current plan status */}
                    <div className="flex flex-col items-end gap-1">
                      <PlanBadge vehicle={v} />
                      <span className="text-xs font-semibold text-blue-600">
                        ₹{pricePerVehicle}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Summary Box */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Vehicles selected</span>
              <span className="font-medium">{selectedVehicles.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Rate per vehicle</span>
              <span className="font-medium">₹{pricePerVehicle}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Plan duration</span>
              <span className="font-medium">
                {selectedPlan === "MONTHLY" ? "1 Month" : "12 Months"}
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-1">
              <span className="text-gray-500">Active until</span>
              <span className="font-semibold text-blue-600">
                {selectedVehicles.length > 0 ? nextRenewalDate() : "—"}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-1">
              <span>Total</span>
              <span className="text-blue-600">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          {/* Next Renewal Info */}
          {selectedVehicles.length > 0 && (
            <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3 border border-blue-100">
              <RefreshCcw className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                <span className="font-semibold">
                  Next renewal: {nextRenewalDate()}
                </span>{" "}
                — In demo mode, renewals are manual. You'll see a reminder here
                before your plan expires. In production, auto-renewal with
                Razorpay will be available.
              </p>
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={processing || selectedVehicles.length === 0}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <>
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay {formatCurrency(totalAmount)} (Demo)
              </>
            )}
          </button>
        </div>

        {/* ── Right: Payment History ── */}
        <div className="card p-6 flex flex-col">
          <h2 className="section-title mb-4">Payment History</h2>

          {!data?.payments?.length ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-400">
              <CreditCard className="w-12 h-12 mb-2 opacity-30" />
              <p className="font-medium">No payments yet</p>
              <p className="text-xs mt-1">
                Your payment history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1">
              {data.payments.map((p: any) => {
                const isActive = p.periodEnd && daysUntil(p.periodEnd) >= 0;
                const daysLeft = p.periodEnd ? daysUntil(p.periodEnd) : null;

                return (
                  <div
                    key={p.id}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2"
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            p.status === "COMPLETED" || p.status === "BYPASSED"
                              ? "bg-green-100"
                              : "bg-yellow-100"
                          }`}
                        >
                          <CheckCircle2
                            className={`w-5 h-5 ${
                              p.status === "COMPLETED" ||
                              p.status === "BYPASSED"
                                ? "text-green-600"
                                : "text-yellow-600"
                            }`}
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">
                            {p.planType} Plan
                          </div>
                          <div className="text-xs text-gray-400">
                            {p.vehicleCount} vehicle
                            {p.vehicleCount > 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-gray-900">
                          {formatCurrency(p.amount)}
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            p.status === "BYPASSED"
                              ? "text-orange-500"
                              : "text-green-600"
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                    </div>

                    {/* Date range */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-white rounded-lg px-3 py-2 border border-gray-100">
                      <IndianRupee className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span>
                        Paid on{" "}
                        <span className="font-medium text-gray-700">
                          {friendlyDate(p.periodStart)}
                        </span>
                      </span>
                    </div>

                    {/* Next renewal row */}
                    <div
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${
                        isActive
                          ? daysLeft !== null && daysLeft <= 7
                            ? "bg-orange-50 border border-orange-100"
                            : "bg-green-50 border border-green-100"
                          : "bg-red-50 border border-red-100"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <CalendarClock
                          className={`w-3.5 h-3.5 ${
                            isActive
                              ? daysLeft !== null && daysLeft <= 7
                                ? "text-orange-500"
                                : "text-green-600"
                              : "text-red-500"
                          }`}
                        />
                        <span
                          className={`font-medium ${
                            isActive
                              ? daysLeft !== null && daysLeft <= 7
                                ? "text-orange-700"
                                : "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {isActive ? "Renews on" : "Expired on"}{" "}
                          {friendlyDate(p.periodEnd)}
                        </span>
                      </div>
                      <span
                        className={`font-semibold text-xs ${
                          isActive
                            ? daysLeft !== null && daysLeft <= 7
                              ? "text-orange-600"
                              : "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {isActive
                          ? daysLeft === 0
                            ? "Today!"
                            : `${daysLeft}d left`
                          : "Expired"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
