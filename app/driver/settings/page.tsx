"use client";
import { useState, useEffect } from "react";
import {
  User,
  Bell,
  HelpCircle,
  ChevronRight,
  Phone,
  MapPin,
  Building2,
  Truck,
  Mail,
  Loader2,
} from "lucide-react";

export default function SettingsPage() {
  const [notifSettings, setNotifSettings] = useState({
    newBooking: true,
    workComplete: true,
    payment: true,
    review: true,
  });
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/drivers/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) setDriver(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const displayName = driver?.name || "—";
  const displayEmail = driver?.email || "—";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="page-title">Settings</h1>

      <div className="card p-6">
        <h2 className="section-title mb-5 flex items-center gap-2">
          <User className="w-5 h-5" /> Profile Information
        </h2>

        {loading ? (
          <div className="flex items-center gap-3 py-6 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading profile...</span>
          </div>
        ) : !driver ? (
          <div className="py-6 text-center text-gray-400 text-sm">
            Could not load profile. Please refresh.
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {initial}
              </div>
              <div>
                <div className="font-bold text-gray-900 text-xl">
                  {displayName}
                </div>
                <div className="text-gray-500 text-sm">{displayEmail}</div>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="badge-info">Driver Account</span>
                  {driver?.orgType === "ORGANIZATION" && (
                    <span className="badge-success">Organisation</span>
                  )}
                  {driver?.isVerified && (
                    <span className="badge-success">✓ Verified</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {[
                { icon: Mail, label: "Email", value: driver?.email },
                { icon: Phone, label: "Phone", value: driver?.phone },
                {
                  icon: Building2,
                  label:
                    driver?.orgType === "ORGANIZATION"
                      ? "Organisation Name"
                      : "Account Type",
                  value:
                    driver?.orgType === "ORGANIZATION"
                      ? driver?.orgName || "—"
                      : "Individual Driver",
                },
                {
                  icon: MapPin,
                  label: "Location",
                  value:
                    [driver?.city, driver?.state].filter(Boolean).join(", ") ||
                    "—",
                },
                {
                  icon: Truck,
                  label: "Registered Vehicles",
                  value: driver?.vehicles?.length
                    ? `${driver.vehicles.length} vehicle${driver.vehicles.length !== 1 ? "s" : ""}`
                    : "0 vehicles",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-medium">
                      {item.label}
                    </div>
                    <div className="text-sm font-semibold text-gray-800 mt-0.5">
                      {item.value || "—"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {driver?.vehicles?.length > 0 && (
              <div className="mb-5">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Your Vehicles
                </div>
                <div className="space-y-2">
                  {driver.vehicles.map((v: any) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between px-4 py-2.5 bg-blue-50 rounded-xl"
                    >
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 bg-purple-600" />
                        <span className="font-semibold text-sm text-gray-900">
                          {v.vehicleNumber}
                        </span>
                        <span className="text-xs text-gray-500">
                          – {v.vehicleType}
                        </span>
                      </div>
                      <span
                        className={
                          v.isActive ? "badge-success" : "badge-danger"
                        }
                      >
                        {v.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm text-gray-500 bg-blue-50 rounded-xl p-4">
              To update your profile details, please contact support at{" "}
              <a
                href="mailto:support@sewageconnect.in"
                className="text-purple-600 font-medium hover:underline"
              >
                support@Mechconnect.in
              </a>
            </div>
          </>
        )}
      </div>

      <div className="card p-6">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" /> Notification Preferences
        </h2>
        <div className="space-y-3">
          {[
            {
              key: "newBooking",
              label: "New Booking Requests",
              desc: "Get notified when a customer enquires",
            },
            {
              key: "workComplete",
              label: "Work Completion",
              desc: "Notification when work detail form is submitted",
            },
            {
              key: "payment",
              label: "Payment Alerts",
              desc: "Payment confirmation and reminders",
            },
            {
              key: "review",
              label: "New Reviews",
              desc: "When customers leave a review",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
            >
              <div>
                <div className="font-medium text-gray-900 text-sm">
                  {item.label}
                </div>
                <div className="text-xs text-gray-400">{item.desc}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    notifSettings[item.key as keyof typeof notifSettings]
                  }
                  onChange={() =>
                    setNotifSettings((p) => ({
                      ...p,
                      [item.key]: !p[item.key as keyof typeof notifSettings],
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5" /> Help & Support
        </h2>
        <div className="space-y-2">
          {[
            "How to add a vehicle?",
            "How Google Forms work for bookings?",
            "Payment & billing FAQ",
            "Contact Support",
            "Terms of Service",
            "Privacy Policy",
          ].map((item) => (
            <button
              key={item}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors text-left"
            >
              <span className="text-sm text-gray-700">{item}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
