"use client";
import { useEffect, useState } from "react";
import {
  Plus,
  Truck,
  Trash2,
  X,
  CheckCircle2,
  ImagePlus,
  Copy,
  Link2,
  ExternalLink,
  Edit2,
  Power,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Globe,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const MONTHLY_PRICE = 99;
const ANNUAL_PRICE = 999;

// ✅ CHANGED: Heavy vehicle types
const VEHICLE_TYPES = [
  "JCB / Excavator",
  "Mobile Crane",
  "Tower Crane",
  "Hydra Crane",
  "Tipper Truck",
  "Loader",
  "Compactor",
  "Concrete Mixer",
  "Bulldozer",
  "Water Tanker",
  "Sewage Tanker",
  "Tractor",
];

// ✅ CHANGED: Weight/size capacity options
const CAPACITY_OPTIONS = [
  "Small (up to 5T)",
  "Medium (5–10T)",
  "Large (10–20T)",
  "Heavy (20–50T)",
  "Extra Heavy (50T+)",
  "Custom",
];

// ✅ CHANGED: Heavy haulage services
const SERVICE_LIST = [
  "Excavation",
  "Land Clearing",
  "Material Loading",
  "Heavy Lifting",
  "Construction Support",
  "Road Work",
  "Building Demolition",
  "Foundation Work",
  "Crane Hire",
  "Tipper Hire",
  "Emergency Service",
  "Night Operations",
];

const DEFAULT_BOOKING_QUESTIONS = [
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

interface Vehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  capacity: string;
  planType: string;
  isActive: boolean;
  services: string[];
  photos: string[];
  images?: string[];
  bookingCount?: number;
}

function getPhoto(v: Vehicle): string | null {
  return v.photos?.[0] || v.images?.[0] || null;
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({
  vehicle,
  onConfirm,
  onCancel,
}: {
  vehicle: Vehicle;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Delete Vehicle?</h3>
            <p className="text-gray-500 mt-1 text-sm">
              This will permanently delete{" "}
              <span className="font-semibold text-gray-800">
                {vehicle.vehicleNumber}
              </span>{" "}
              and all its booking records.
            </p>
          </div>
          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Vehicle Card ─────────────────────────────────────────────────────────────
function VehicleCard({
  vehicle,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  vehicle: Vehicle;
  onEdit: (v: Vehicle) => void;
  onDelete: (v: Vehicle) => void;
  onToggleActive: (v: Vehicle) => void;
}) {
  const formLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/driver/booking-form/${vehicle.id}`
      : `/driver/booking-form/${vehicle.id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(formLink);
    toast.success("Booking form link copied!");
  };

  const photo = getPhoto(vehicle);

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border shadow-sm overflow-hidden transition-all",
        vehicle.isActive ? "border-gray-200" : "border-gray-100 opacity-70",
      )}
    >
      {/* ✅ CHANGED: bg-blue-50 → bg-purple-50 */}
      <div
        className={cn(
          "px-4 py-3 flex items-center justify-between",
          vehicle.isActive ? "bg-purple-50" : "bg-gray-50",
        )}
      >
        <div className="flex items-center gap-2">
          {/* ✅ CHANGED: text-blue-600 → text-purple-600 */}
          <Truck
            className={cn(
              "w-5 h-5",
              vehicle.isActive ? "text-purple-600" : "text-gray-400",
            )}
          />
          <span className="font-bold text-gray-900">
            {vehicle.vehicleNumber}
          </span>
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              vehicle.isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-500",
            )}
          >
            {vehicle.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(vehicle)}
            className="p-1.5 rounded-lg hover:bg-purple-100 text-purple-600 transition"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleActive(vehicle)}
            className={cn(
              "p-1.5 rounded-lg transition",
              vehicle.isActive
                ? "hover:bg-orange-100 text-orange-500"
                : "hover:bg-green-100 text-green-600",
            )}
            title={vehicle.isActive ? "Deactivate" : "Reactivate"}
          >
            {vehicle.isActive ? (
              <Power className="w-4 h-4" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => onDelete(vehicle)}
            className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Photo + Info row */}
      <div className="flex gap-3 p-4">
        <div className="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
          {photo ? (
            <img
              src={photo}
              alt={vehicle.vehicleNumber}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
              <Truck className="w-8 h-8 text-gray-300" />
              <span className="text-xs text-gray-300">No photo</span>
            </div>
          )}
        </div>

        <div className="flex-1 grid grid-cols-3 gap-2 text-sm">
          <div className="bg-gray-50 rounded-xl p-2 text-center">
            <p className="text-gray-400 text-xs">Type</p>
            <p className="font-semibold text-gray-800 truncate text-xs">
              {vehicle.vehicleType}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2 text-center">
            <p className="text-gray-400 text-xs">Capacity</p>
            <p className="font-semibold text-gray-800 text-xs">
              {vehicle.capacity}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2 text-center">
            <p className="text-gray-400 text-xs">Bookings</p>
            {/* ✅ CHANGED: text-blue-600 → text-purple-600 */}
            <p className="font-bold text-purple-600 text-lg leading-tight">
              {vehicle.bookingCount ?? 0}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-3">
        {vehicle.services?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {vehicle.services.slice(0, 3).map((s) => (
              <span
                key={s}
                // ✅ CHANGED: bg-blue-50 text-blue-700 → bg-purple-50 text-purple-700
                className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full"
              >
                {s}
              </span>
            ))}
            {vehicle.services.length > 3 && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                +{vehicle.services.length - 3}
              </span>
            )}
          </div>
        )}

        {/* ✅ CHANGED: border-blue-200 bg-blue-50 → border-purple-200 bg-purple-50 */}
        <div className="border border-dashed border-purple-200 rounded-xl p-3 bg-purple-50/50">
          {/* ✅ CHANGED: text-blue-700 → text-purple-700 */}
          <p className="text-xs font-semibold text-purple-700 mb-1.5 flex items-center gap-1">
            <Link2 className="w-3.5 h-3.5" /> Booking Form Link
          </p>
          {/* ✅ CHANGED: border-blue-100 → border-purple-100 */}
          <p className="text-xs text-gray-500 truncate mb-2 font-mono bg-white rounded px-2 py-1 border border-purple-100">
            /driver/booking-form/{vehicle.id.slice(0, 12)}...
          </p>
          <div className="flex gap-2">
            {/* ✅ CHANGED: bg-blue-600 hover:bg-blue-700 → bg-purple-600 hover:bg-purple-700 */}
            <button
              onClick={copyLink}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Link
            </button>
            {/* ✅ CHANGED: border-blue-200 text-blue-700 hover:bg-blue-50 → purple */}
            <a
              href={formLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-purple-200 text-purple-700 text-xs font-medium rounded-lg hover:bg-purple-50 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Image Manager ────────────────────────────────────────────────────────────
function ImageManager({
  previewUrls,
  onAdd,
  onRemove,
}: {
  previewUrls: string[];
  onAdd: (urls: string[]) => void;
  onRemove: (i: number) => void;
}) {
  const [urlInput, setUrlInput] = useState("");
  const [tab, setTab] = useState<"device" | "url">("device");

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - previewUrls.length;
    const toAdd = files.slice(0, remaining);
    const urls = toAdd.map((f) => URL.createObjectURL(f));
    onAdd(urls);
    e.target.value = "";
  };

  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (previewUrls.length >= 5) {
      toast.error("Max 5 photos");
      return;
    }
    if (!trimmed.startsWith("http")) {
      toast.error("Enter a valid URL starting with http");
      return;
    }
    onAdd([trimmed]);
    setUrlInput("");
    toast.success("Image URL added!");
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Vehicle Photos (max 5)
      </label>

      <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-3 w-fit">
        {/* ✅ CHANGED: bg-blue-600 → bg-purple-600 */}
        <button
          type="button"
          onClick={() => setTab("device")}
          className={cn(
            "px-4 py-2 text-xs font-semibold transition",
            tab === "device"
              ? "bg-purple-600 text-white"
              : "bg-white text-gray-500 hover:bg-gray-50",
          )}
        >
          📁 Upload from Device
        </button>
        <button
          type="button"
          onClick={() => setTab("url")}
          className={cn(
            "px-4 py-2 text-xs font-semibold transition",
            tab === "url"
              ? "bg-purple-600 text-white"
              : "bg-white text-gray-500 hover:bg-gray-50",
          )}
        >
          🌐 Add Image URL
        </button>
      </div>

      {tab === "device" && (
        <label
          className={cn(
            "flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed cursor-pointer transition",
            previewUrls.length >= 5
              ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
              : // ✅ CHANGED: border-blue-300 hover:border-blue-400 hover:bg-blue-50 → purple
                "border-purple-300 hover:border-purple-400 hover:bg-purple-50",
          )}
        >
          {/* ✅ CHANGED: text-blue-400 → text-purple-400 */}
          <ImagePlus className="w-7 h-7 text-purple-400 mb-1" />
          <span className="text-xs text-gray-500">
            Click to upload photos ({previewUrls.length}/5)
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFiles}
            disabled={previewUrls.length >= 5}
          />
        </label>
      )}

      {tab === "url" && (
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addUrl()}
              placeholder="https://example.com/truck-photo.jpg"
              // ✅ CHANGED: focus:ring-blue-500 → focus:ring-purple-500
              className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {/* ✅ CHANGED: bg-blue-600 hover:bg-blue-700 → bg-purple-600 hover:bg-purple-700 */}
          <button
            type="button"
            onClick={addUrl}
            disabled={previewUrls.length >= 5}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-40 transition"
          >
            Add
          </button>
        </div>
      )}

      {previewUrls.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-3">
          {previewUrls.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0"
            >
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = "none";
                }}
              />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-md transition z-10"
                title="Remove photo"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-center text-xs py-0.5 pointer-events-none">
                {i + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Vehicle Form ─────────────────────────────────────────────────────────────
function VehicleForm({
  editVehicle,
  onSuccess,
  onClose,
}: {
  editVehicle?: Vehicle | null;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>(
    editVehicle?.photos?.length
      ? editVehicle.photos
      : editVehicle?.images || [],
  );
  const [selectedServices, setSelectedServices] = useState<string[]>(
    editVehicle?.services || [],
  );
  const [plan, setPlan] = useState<"MONTHLY" | "ANNUAL">(
    (editVehicle?.planType as any) || "MONTHLY",
  );
  const [bookingQuestions, setBookingQuestions] = useState(
    DEFAULT_BOOKING_QUESTIONS,
  );
  const [customQuestion, setCustomQuestion] = useState("");
  const [form, setForm] = useState({
    vehicleNumber: editVehicle?.vehicleNumber || "",
    vehicleType: editVehicle?.vehicleType || "",
    capacity: editVehicle?.capacity || "",
  });

  const handleAddImages = (urls: string[]) =>
    setPreviewUrls((prev) => [...prev, ...urls].slice(0, 5));
  const handleRemoveImage = (i: number) =>
    setPreviewUrls((prev) => prev.filter((_, idx) => idx !== i));
  const toggleService = (s: string) =>
    setSelectedServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  const addCustomQuestion = () => {
    if (!customQuestion.trim()) return;
    setBookingQuestions((prev) => [
      ...prev,
      {
        id: `custom_${Date.now()}`,
        label: customQuestion.trim(),
        type: "text",
        required: false,
      },
    ]);
    setCustomQuestion("");
  };
  const removeQuestion = (id: string) =>
    setBookingQuestions((prev) =>
      prev.filter((q) => q.id !== id || q.required),
    );

  const handleSubmit = async () => {
    if (!form.vehicleNumber || !form.vehicleType || !form.capacity) {
      toast.error("Please fill all vehicle details");
      return;
    }
    setLoading(true);
    try {
      const finalPhotos: string[] = [];
      for (const url of previewUrls) {
        if (url.startsWith("blob:")) {
          try {
            const res = await fetch(url);
            const blob = await res.blob();
            const base64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
            finalPhotos.push(base64);
          } catch {
            // skip broken blob
          }
        } else {
          finalPhotos.push(url);
        }
      }

      const payload = {
        vehicleNumber: form.vehicleNumber,
        vehicleType: form.vehicleType,
        capacity: form.capacity,
        planType: plan,
        services: selectedServices,
        photos: finalPhotos,
        bookingFormQuestions: bookingQuestions,
      };

      const method = editVehicle ? "PATCH" : "POST";
      const url = editVehicle
        ? `/api/vehicles?id=${editVehicle.id}`
        : "/api/vehicles";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }
      toast.success(
        editVehicle
          ? "Vehicle updated!"
          : "Vehicle added! Share the booking form link with your driver.",
      );
      onSuccess();
    } catch (e: any) {
      toast.error(e.message || "Failed to save vehicle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* ✅ CHANGED: from-blue-600 to-blue-700 → from-purple-600 to-purple-700 */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-2xl flex-shrink-0">
          <h2 className="font-bold text-lg">
            {editVehicle ? "Edit Vehicle" : "Add New Vehicle"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!editVehicle && (
          <div className="flex border-b flex-shrink-0">
            {[
              { n: 1, label: "Vehicle Details" },
              { n: 2, label: "Booking Form" },
            ].map((t) => (
              <button
                key={t.n}
                onClick={() => setStep(t.n)}
                className={cn(
                  "flex-1 py-3 text-sm font-medium transition border-b-2",
                  // ✅ CHANGED: border-blue-600 text-blue-600 → border-purple-600 text-purple-600
                  step === t.n
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-400 hover:text-gray-600",
                )}
              >
                Step {t.n}: {t.label}
              </button>
            ))}
          </div>
        )}

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Number *
                </label>
                <input
                  value={form.vehicleNumber}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      vehicleNumber: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="TN 01 AB 1234"
                  // ✅ CHANGED: focus:ring-blue-500 → focus:ring-purple-500
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type *
                </label>
                <select
                  value={form.vehicleType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, vehicleType: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select type</option>
                  {VEHICLE_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity *
                </label>
                <select
                  value={form.capacity}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, capacity: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select capacity</option>
                  {CAPACITY_OPTIONS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subscription Plan
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      ["MONTHLY", MONTHLY_PRICE, "/mo"],
                      ["ANNUAL", ANNUAL_PRICE, "/yr"],
                    ] as const
                  ).map(([p, price, suffix]) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlan(p as any)}
                      className={cn(
                        "border-2 rounded-xl p-3 text-left transition",
                        // ✅ CHANGED: border-blue-600 bg-blue-50 → border-purple-600 bg-purple-50
                        plan === p
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300",
                      )}
                    >
                      <p
                        className={cn(
                          "font-bold",
                          // ✅ CHANGED: text-blue-700 → text-purple-700
                          plan === p ? "text-purple-700" : "text-gray-700",
                        )}
                      >
                        {p}
                      </p>
                      <p className="text-sm text-gray-500">
                        ₹{price}
                        {suffix}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Services Offered
                </label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_LIST.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleService(s)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition",
                        // ✅ CHANGED: bg-blue-600 border-blue-600 hover:border-blue-300 → purple
                        selectedServices.includes(s)
                          ? "bg-purple-600 text-white border-purple-600"
                          : "border-gray-200 text-gray-600 hover:border-purple-300",
                      )}
                    >
                      {selectedServices.includes(s) && (
                        <CheckCircle2 className="w-3 h-3 inline mr-1" />
                      )}
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <ImageManager
                previewUrls={previewUrls}
                onAdd={handleAddImages}
                onRemove={handleRemoveImage}
              />

              {!editVehicle ? (
                // ✅ CHANGED: bg-blue-600 hover:bg-blue-700 → bg-purple-600 hover:bg-purple-700
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2"
                >
                  Next: Setup Booking Form <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-60 transition"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              )}
            </>
          )}

          {step === 2 && (
            <>
              {/* ✅ CHANGED: bg-blue-50 border-blue-200 text-blue-800 text-blue-600 → purple */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-purple-800 mb-1">
                  📋 Booking Form
                </p>
                <p className="text-xs text-purple-600">
                  After adding the vehicle, you'll get a unique link. Share it
                  with your driver — they fill it after each job and data
                  appears in your Revenue page automatically.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Form Fields
                </p>
                <div className="space-y-2">
                  {bookingQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {q.label}
                        </p>
                        <p className="text-xs text-gray-400">
                          {q.type} {q.required ? "• required" : "• optional"}
                        </p>
                      </div>
                      {!q.required ? (
                        <button
                          type="button"
                          onClick={() => removeQuestion(q.id)}
                          className="text-red-400 hover:text-red-600 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add Custom Question
                </label>
                <div className="flex gap-2">
                  <input
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomQuestion()}
                    placeholder="e.g. Customer Phone Number"
                    // ✅ CHANGED: focus:ring-blue-500 → focus:ring-purple-500
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={addCustomQuestion}
                    className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200 transition"
                  >
                    + Add
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                {/* ✅ CHANGED: bg-blue-600 hover:bg-blue-700 → bg-purple-600 hover:bg-purple-700 */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-grow py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-60 transition"
                >
                  {loading ? "Saving..." : "Add Vehicle & Generate Link"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vehicles");
      const data = await res.json();
      setVehicles(data.vehicles || data || []);
    } catch {
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleToggleActive = async (v: Vehicle) => {
    try {
      const res = await fetch(`/api/vehicles?id=${v.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !v.isActive }),
      });
      if (!res.ok) throw new Error();
      toast.success(v.isActive ? "Vehicle deactivated" : "Vehicle reactivated");
      loadVehicles();
    } catch {
      toast.error("Failed to update vehicle");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/vehicles?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Vehicle deleted");
      setDeleteTarget(null);
      loadVehicles();
    } catch {
      toast.error("Failed to delete vehicle");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Vehicles</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""}{" "}
              registered
            </p>
          </div>
          {/* ✅ CHANGED: bg-blue-600 hover:bg-blue-700 → bg-purple-600 hover:bg-purple-700 */}
          <button
            onClick={() => {
              setEditVehicle(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition shadow-sm"
          >
            <Plus className="w-5 h-5" /> Add Vehicle
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border h-48 animate-pulse"
              />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-16">
            <Truck className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500">
              No vehicles yet
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Add your first vehicle to get started
            </p>
            {/* ✅ CHANGED: bg-blue-600 hover:bg-blue-700 → bg-purple-600 hover:bg-purple-700 */}
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition"
            >
              Add Vehicle
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {vehicles.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                onEdit={(v) => {
                  setEditVehicle(v);
                  setShowForm(true);
                }}
                onDelete={setDeleteTarget}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <VehicleForm
          editVehicle={editVehicle}
          onSuccess={() => {
            setShowForm(false);
            setEditVehicle(null);
            loadVehicles();
          }}
          onClose={() => {
            setShowForm(false);
            setEditVehicle(null);
          }}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          vehicle={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
