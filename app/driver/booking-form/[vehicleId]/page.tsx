"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Truck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  IndianRupee,
  MapPin,
  ClipboardList,
} from "lucide-react";

interface VehicleInfo {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  capacity: string;
  driverName: string;
  bookingFormQuestions?: Array<{
    id: string;
    label: string;
    type: string;
    required: boolean;
  }>;
}

const DEFAULT_QUESTIONS = [
  { id: "area", label: "Work Area / Location", type: "text", required: true },
  {
    id: "cost",
    label: "Revenue Collected (₹)",
    type: "number",
    required: true,
  },
  {
    id: "fuelExpense",
    label: "Fuel Expense (₹)",
    type: "number",
    required: false,
  },
  {
    id: "driverSalary",
    label: "Driver Salary (₹)",
    type: "number",
    required: false,
  },
  {
    id: "otherExpense",
    label: "Other Expenses (₹)",
    type: "number",
    required: false,
  },
  { id: "notes", label: "Notes / Remarks", type: "textarea", required: false },
];

export default function BookingFormPage() {
  const { vehicleId } = useParams() as { vehicleId: string };
  const [vehicle, setVehicle] = useState<VehicleInfo | null>(null);
  const [loadingVehicle, setLoadingVehicle] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`/api/vehicles/${vehicleId}/public`)
      .then((r) => r.json())
      .then((d) => setVehicle(d.vehicle || d))
      .catch(() => setError("Vehicle not found"))
      .finally(() => setLoadingVehicle(false));
  }, [vehicleId]);

  const questions = vehicle?.bookingFormQuestions?.length
    ? vehicle.bookingFormQuestions
    : DEFAULT_QUESTIONS;

  const setValue = (id: string, val: string) => {
    setFormValues((prev) => ({ ...prev, [id]: val }));
  };

  const getProfit = () => {
    const revenue = parseFloat(formValues["cost"] || "0");
    const fuel = parseFloat(formValues["fuelExpense"] || "0");
    const salary = parseFloat(formValues["driverSalary"] || "0");
    const other = parseFloat(formValues["otherExpense"] || "0");
    return revenue - fuel - salary - other;
  };

  const handleSubmit = async () => {
    // Validate required
    for (const q of questions) {
      if (q.required && !formValues[q.id]?.trim()) {
        setError(`Please fill in: ${q.label}`);
        return;
      }
    }
    setError("");
    setSubmitting(true);
    try {
      const payload: Record<string, any> = { vehicleId };
      for (const q of questions) {
        const val = formValues[q.id] || "";
        if (q.type === "number") {
          payload[q.id] = parseFloat(val) || 0;
        } else {
          payload[q.id] = val;
        }
      }

      const res = await fetch("/api/bookings/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Submission failed");
      }

      setSubmitted(true);
    } catch (e: any) {
      setError(e.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ CHANGED: from-blue-600 to-blue-800 → from-purple-600 to-purple-800
  if (loadingVehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 to-purple-800 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" />
          <p className="font-medium">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!vehicle && !loadingVehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-500 to-red-700 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <AlertCircle className="w-14 h-14 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Vehicle Not Found</h2>
          <p className="text-red-100 mt-2 text-sm">
            This booking form link is invalid or expired.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-500 to-green-700 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-sm">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-14 h-14 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Job Recorded!</h2>
          <p className="text-green-100 mb-6">
            Booking details have been saved successfully. The organiser's
            revenue page has been updated.
          </p>
          <div className="bg-white/10 rounded-2xl p-4 text-left space-y-2">
            {formValues["area"] && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-200" />
                <span className="text-sm">{formValues["area"]}</span>
              </div>
            )}
            {formValues["cost"] && (
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-green-200" />
                <span className="text-sm">Revenue: ₹{formValues["cost"]}</span>
              </div>
            )}
            <div className="flex items-center gap-2 pt-1 border-t border-white/20">
              <span className="text-sm font-semibold">
                Net Profit: ₹{getProfit().toFixed(0)}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormValues({});
            }}
            className="mt-6 w-full py-3 bg-white text-green-700 rounded-xl font-semibold hover:bg-green-50 transition"
          >
            Submit Another Job
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header — ✅ CHANGED: from-blue-600 to-blue-700 → from-purple-600 to-purple-700 */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-6 pb-10">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Truck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{vehicle!.vehicleNumber}</h1>
              <p className="text-purple-100 text-sm">
                {vehicle!.vehicleType} • {vehicle!.capacity}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
            <ClipboardList className="w-4 h-4 text-purple-200" />
            <p className="text-sm text-purple-100">
              Job Completion Form — Fill after every booking
            </p>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="max-w-md mx-auto px-4 -mt-6 pb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-5 space-y-4">
            {questions.map((q) => (
              <div key={q.id}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {q.label}
                  {q.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {/* ✅ CHANGED: focus:ring-blue-500 → focus:ring-purple-500 */}
                {q.type === "textarea" ? (
                  <textarea
                    value={formValues[q.id] || ""}
                    onChange={(e) => setValue(q.id, e.target.value)}
                    rows={3}
                    placeholder={`Enter ${q.label.toLowerCase()}`}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                ) : (
                  <div className="relative">
                    {q.type === "number" && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        ₹
                      </span>
                    )}
                    <input
                      type={q.type === "number" ? "number" : "text"}
                      inputMode={q.type === "number" ? "numeric" : "text"}
                      value={formValues[q.id] || ""}
                      onChange={(e) => setValue(q.id, e.target.value)}
                      placeholder={
                        q.type === "number"
                          ? "0"
                          : `Enter ${q.label.toLowerCase()}`
                      }
                      className={`w-full border border-gray-200 rounded-xl py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${q.type === "number" ? "pl-8 pr-4" : "px-4"}`}
                    />
                  </div>
                )}
              </div>
            ))}

            {/* Live profit preview — ✅ CHANGED: from-blue-50 border-blue-100 → from-purple-50 border-purple-100 */}
            {(formValues["cost"] ||
              formValues["fuelExpense"] ||
              formValues["driverSalary"]) && (
              <div className="bg-gradient-to-r from-purple-50 to-green-50 border border-purple-100 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">
                  💰 Live Profit Preview
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <span>
                    Revenue:{" "}
                    <strong className="text-green-700">
                      ₹{formValues["cost"] || 0}
                    </strong>
                  </span>
                  <span>
                    Fuel:{" "}
                    <strong className="text-red-600">
                      ₹{formValues["fuelExpense"] || 0}
                    </strong>
                  </span>
                  <span>
                    Salary:{" "}
                    <strong className="text-red-600">
                      ₹{formValues["driverSalary"] || 0}
                    </strong>
                  </span>
                  <span>
                    Other:{" "}
                    <strong className="text-red-600">
                      ₹{formValues["otherExpense"] || 0}
                    </strong>
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-purple-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Net Profit
                  </span>
                  <span
                    className={`text-lg font-bold ${getProfit() >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    ₹{getProfit().toFixed(0)}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* ✅ CHANGED: bg-blue-600 hover:bg-blue-700 → bg-purple-600 hover:bg-purple-700 */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3.5 bg-purple-600 text-white rounded-xl font-bold text-base hover:bg-purple-700 disabled:opacity-60 transition flex items-center justify-center gap-2 shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" /> Submit Job Record
                </>
              )}
            </button>
          </div>
        </div>

        {/* ✅ CHANGED: SewageConnect → MechConnect, organiser's → operator's */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Powered by MechConnect • Data goes directly to operator's revenue
          dashboard
        </p>
      </div>
    </div>
  );
}
