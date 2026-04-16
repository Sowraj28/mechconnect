"use client";
import { useEffect, useState } from "react";
import {
  Download,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Truck,
  MapPin,
  Fuel,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  CheckSquare,
  Square,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BookingItem {
  id: string;
  area: string;
  city: string;
  customerName: string;
  customerPhone: string;
  cost: number;
  fuelExpense: number;
  driverSalary: number;
  otherExpense: number;
  notes?: string | null;
  status: string;
  completedAt: string | null;
  createdAt: string;
}

interface VehicleData {
  vehicleId: string;
  vehicleNumber: string;
  vehicleType: string;
  capacity: string;
  planType: string;
  isActive: boolean;
  totalBookings: number;
  totalRevenue: number;
  totalFuel: number;
  totalSalary: number;
  totalOther: number;
  totalExpense: number;
  netProfit: number;
  bookings: BookingItem[];
}

// ─── Export mode: "vehicle" = select vehicles, "job" = select individual jobs ─
type ExportMode = "none" | "vehicle" | "job";

export default function RevenuePage() {
  const [data, setData] = useState<any>(null);
  const [selected, setSelected] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [expandedVehicle, setExpandedVehicle] = useState<string | null>(null);

  // Vehicle-level export
  const [vehicleExportMode, setVehicleExportMode] = useState(false);
  const [checkedVehicles, setCheckedVehicles] = useState<Set<string>>(
    new Set(),
  );

  // Job-level export — stores booking IDs
  const [jobExportMode, setJobExportMode] = useState(false);
  const [checkedJobs, setCheckedJobs] = useState<Set<string>>(new Set());

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    const url =
      selected === "ALL"
        ? "/api/revenue"
        : `/api/revenue?vehicleId=${selected}`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selected]);

  const vehicles: VehicleData[] = data?.vehicles || [];
  const totals = data?.totals || {};
  const isProfit = (totals.netProfit || 0) >= 0;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const allBookings: (BookingItem & {
    vehicleNumber: string;
    vehicleType: string;
  })[] = vehicles.flatMap((v) =>
    v.bookings.map((b) => ({
      ...b,
      vehicleNumber: v.vehicleNumber,
      vehicleType: v.vehicleType,
    })),
  );

  const toggleVehicle = (id: string) =>
    setCheckedVehicles((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleJob = (id: string) =>
    setCheckedJobs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectAllVehicles = () =>
    setCheckedVehicles(new Set(vehicles.map((v) => v.vehicleId)));

  const selectAllJobs = () =>
    setCheckedJobs(new Set(allBookings.map((b) => b.id)));

  const clearAllJobs = () => setCheckedJobs(new Set());
  const clearAllVehicles = () => setCheckedVehicles(new Set());

  const cancelExport = () => {
    setVehicleExportMode(false);
    setJobExportMode(false);
    setCheckedVehicles(new Set());
    setCheckedJobs(new Set());
  };

  // ── PDF: export selected JOBS ──────────────────────────────────────────────
  async function exportJobsPDF(jobIds: string[]) {
    if (jobIds.length === 0) {
      toast.error("Select at least one job");
      return;
    }
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF();

      // Header
      doc.setFillColor(109, 40, 217);
      doc.rect(0, 0, 210, 30, "F");
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text("MechConnect — Job Export", 14, 18);
      doc.setFontSize(9);
      doc.text(
        `Generated: ${new Date().toLocaleString("en-IN")}  •  ${jobIds.length} job(s) selected`,
        14,
        26,
      );

      const selectedJobs = allBookings.filter((b) => jobIds.includes(b.id));
      let totalRev = 0,
        totalExp = 0,
        totalNet = 0;

      const rows = selectedJobs.map((b) => {
        const net = b.cost - b.fuelExpense - b.driverSalary - b.otherExpense;
        totalRev += b.cost;
        totalExp += b.fuelExpense + b.driverSalary + b.otherExpense;
        totalNet += net;
        return [
          b.completedAt
            ? new Date(b.completedAt).toLocaleDateString("en-IN")
            : "—",
          `${b.vehicleNumber}\n${b.vehicleType}`,
          b.area || "—",
          b.customerName || "—",
          formatCurrency(b.cost),
          formatCurrency(b.fuelExpense),
          formatCurrency(b.driverSalary),
          formatCurrency(b.otherExpense),
          formatCurrency(net),
          net >= 0 ? "Profit" : "Loss",
        ];
      });

      autoTable(doc, {
        startY: 40,
        head: [
          [
            "Date",
            "Vehicle",
            "Area",
            "Customer",
            "Revenue",
            "Fuel",
            "Salary",
            "Other",
            "Net",
            "P/L",
          ],
        ],
        body: rows,
        foot: [
          [
            "TOTAL",
            "",
            "",
            "",
            formatCurrency(totalRev),
            "",
            "",
            formatCurrency(totalExp),
            formatCurrency(totalNet),
            totalNet >= 0 ? "PROFIT" : "LOSS",
          ],
        ],
        styles: { fontSize: 7.5, cellPadding: 2 },
        headStyles: { fillColor: [109, 40, 217] },
        footStyles: {
          fillColor: [240, 253, 244],
          textColor: [0, 100, 0],
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: { 9: { fontStyle: "bold" } },
      });

      // Notes section
      const jobsWithNotes = selectedJobs.filter((b) => b.notes);
      if (jobsWithNotes.length > 0) {
        let y = (doc as any).lastAutoTable.finalY + 12;
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        doc.text("Notes / Remarks", 14, y);
        y += 6;
        for (const b of jobsWithNotes) {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.setFontSize(8.5);
          doc.setTextColor(100, 100, 100);
          doc.text(
            `• ${b.vehicleNumber} / ${b.area || "—"}: ${b.notes}`,
            14,
            y,
          );
          y += 6;
        }
      }

      doc.save(`jobs-export-${Date.now()}.pdf`);
      toast.success(`Exported ${jobIds.length} job(s) to PDF!`);
      cancelExport();
    } catch (err) {
      console.error(err);
      toast.error("PDF export failed");
    }
  }

  // ── PDF: export selected VEHICLES (summary + all their jobs) ──────────────
  async function exportVehiclesPDF(vehicleIds?: string[]) {
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF();

      doc.setFillColor(245, 243, 255);
      doc.rect(0, 0, 210, 30, "F");
      doc.setFontSize(18);
      doc.setTextColor(109, 40, 217);
      doc.text("MechConnect — Revenue Report", 14, 18);
      doc.setFontSize(9);
      doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 14, 26);

      const vehiclesToExport = vehicleIds
        ? vehicles.filter((v) => vehicleIds.includes(v.vehicleId))
        : vehicles;

      let y = 40;

      if (vehiclesToExport.length > 1) {
        doc.setFontSize(14);
        doc.setTextColor(26, 86, 219);
        doc.text("Overall Summary", 14, y);
        y += 6;

        const totalRev = vehiclesToExport.reduce(
          (s, v) => s + v.totalRevenue,
          0,
        );
        const totalExp = vehiclesToExport.reduce(
          (s, v) => s + v.totalExpense,
          0,
        );
        const totalNet = vehiclesToExport.reduce((s, v) => s + v.netProfit, 0);
        const totalJobs = vehiclesToExport.reduce(
          (s, v) => s + v.totalBookings,
          0,
        );

        autoTable(doc, {
          startY: y,
          head: [
            ["Vehicle", "Jobs", "Revenue", "Expense", "Net Profit", "Status"],
          ],
          body: vehiclesToExport.map((v) => [
            `${v.vehicleNumber}\n${v.vehicleType}`,
            v.totalBookings,
            formatCurrency(v.totalRevenue),
            formatCurrency(v.totalExpense),
            formatCurrency(v.netProfit),
            v.netProfit >= 0 ? "✓ PROFIT" : "✗ LOSS",
          ]),
          foot: [
            [
              "TOTAL",
              totalJobs,
              formatCurrency(totalRev),
              formatCurrency(totalExp),
              formatCurrency(totalNet),
              totalNet >= 0 ? "PROFIT" : "LOSS",
            ],
          ],
          styles: { fontSize: 8 },
          headStyles: { fillColor: [26, 86, 219] },
          footStyles: {
            fillColor: [240, 253, 244],
            textColor: [0, 100, 0],
            fontStyle: "bold",
          },
        });

        y = (doc as any).lastAutoTable.finalY + 15;
      }

      for (const v of vehiclesToExport) {
        if (y > 240) {
          doc.addPage();
          y = 20;
        }

        doc.setFillColor(239, 246, 255);
        doc.rect(10, y - 4, 190, 16, "F");
        doc.setFontSize(13);
        doc.setTextColor(26, 86, 219);
        doc.text(`${v.vehicleNumber}  —  ${v.vehicleType}`, 14, y + 6);

        const statusColor: [number, number, number] =
          v.netProfit >= 0 ? [0, 150, 0] : [200, 0, 0];
        doc.setFontSize(10);
        doc.setTextColor(...statusColor);
        doc.text(
          `${v.netProfit >= 0 ? "PROFIT" : "LOSS"}: ${formatCurrency(Math.abs(v.netProfit))}`,
          150,
          y + 6,
        );
        y += 16;

        autoTable(doc, {
          startY: y,
          head: [["Metric", "Amount"]],
          body: [
            ["Total Jobs Completed", `${v.totalBookings}`],
            ["Total Revenue", formatCurrency(v.totalRevenue)],
            ["Fuel Expense", formatCurrency(v.totalFuel)],
            ["Driver Salary", formatCurrency(v.totalSalary)],
            ["Other Expenses", formatCurrency(v.totalOther)],
            ["Total Expense", formatCurrency(v.totalExpense)],
            [
              `Net ${v.netProfit >= 0 ? "Profit" : "Loss"}`,
              formatCurrency(Math.abs(v.netProfit)),
            ],
          ],
          styles: { fontSize: 9 },
          headStyles: { fillColor: [59, 130, 246] },
          alternateRowStyles: { fillColor: [248, 250, 252] },
        });

        y = (doc as any).lastAutoTable.finalY + 8;

        if (v.bookings.length > 0) {
          if (y > 240) {
            doc.addPage();
            y = 20;
          }
          doc.setFontSize(10);
          doc.setTextColor(60, 60, 60);
          doc.text("Job-by-Job Breakdown:", 14, y);
          y += 5;

          autoTable(doc, {
            startY: y,
            head: [
              [
                "Date",
                "Area",
                "Revenue",
                "Fuel",
                "Salary",
                "Other",
                "Net",
                "P/L",
              ],
            ],
            body: v.bookings.map((b) => {
              const net =
                b.cost - b.fuelExpense - b.driverSalary - b.otherExpense;
              return [
                b.completedAt
                  ? new Date(b.completedAt).toLocaleDateString("en-IN")
                  : "—",
                b.area,
                formatCurrency(b.cost),
                formatCurrency(b.fuelExpense),
                formatCurrency(b.driverSalary),
                formatCurrency(b.otherExpense),
                formatCurrency(net),
                net >= 0 ? "Profit" : "Loss",
              ];
            }),
            styles: { fontSize: 7.5 },
            headStyles: { fillColor: [100, 160, 230] },
            alternateRowStyles: { fillColor: [248, 250, 252] },
          });

          y = (doc as any).lastAutoTable.finalY + 15;
        }
      }

      const suffix =
        vehicleIds?.length === 1
          ? vehiclesToExport[0]?.vehicleNumber
          : "grouped";
      doc.save(`revenue-${suffix || "all"}-${Date.now()}.pdf`);
      toast.success("PDF exported!");
      cancelExport();
    } catch (err) {
      console.error(err);
      toast.error("PDF export failed");
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-xl" />
        ))}
      </div>
    );

  const pieData = [
    {
      name: "Fuel",
      value: vehicles.reduce((s, v) => s + v.totalFuel, 0),
      color: "#f97316",
    },
    {
      name: "Salary",
      value: vehicles.reduce((s, v) => s + v.totalSalary, 0),
      color: "#8b5cf6",
    },
    {
      name: "Other",
      value: vehicles.reduce((s, v) => s + v.totalOther, 0),
      color: "#6b7280",
    },
    {
      name: "Net Profit",
      value: Math.max(totals.netProfit || 0, 0),
      color: "#10b981",
    },
  ].filter((d) => d.value > 0);

  const activeExportMode = vehicleExportMode || jobExportMode;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Revenue & Expenses</h1>
          <p className="text-gray-500 text-sm">
            All job submissions from your drivers
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="input-field w-auto"
          >
            <option value="ALL">All Vehicles</option>
            {vehicles.map((v) => (
              <option key={v.vehicleId} value={v.vehicleId}>
                {v.vehicleNumber}
              </option>
            ))}
          </select>

          {/* Job-level export */}
          <button
            onClick={() => {
              setJobExportMode(!jobExportMode);
              setVehicleExportMode(false);
              setCheckedJobs(new Set());
              setCheckedVehicles(new Set());
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm border transition ${jobExportMode ? "bg-purple-100 border-purple-300 text-purple-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
          >
            <ClipboardList className="w-4 h-4" /> Select Jobs
          </button>

          {/* Vehicle-level export */}
          <button
            onClick={() => {
              setVehicleExportMode(!vehicleExportMode);
              setJobExportMode(false);
              setCheckedVehicles(new Set());
              setCheckedJobs(new Set());
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm border transition ${vehicleExportMode ? "bg-blue-100 border-blue-300 text-blue-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
          >
            <CheckSquare className="w-4 h-4" /> Select Vehicles
          </button>

          <button
            onClick={() => exportVehiclesPDF()}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" /> Export All PDF
          </button>
        </div>
      </div>

      {/* ── Job Export Banner ── */}
      {jobExportMode && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-5 h-5 text-purple-600" />
            <div>
              <p className="font-semibold text-purple-800 text-sm">
                Select individual jobs to export
              </p>
              <p className="text-xs text-purple-500">
                {checkedJobs.size} job{checkedJobs.size !== 1 ? "s" : ""}{" "}
                selected across all vehicles
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={selectAllJobs}
              className="text-xs px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition font-medium"
            >
              Select All
            </button>
            <button
              onClick={clearAllJobs}
              className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Clear
            </button>
            <button
              onClick={() => exportJobsPDF(Array.from(checkedJobs))}
              disabled={checkedJobs.size === 0}
              className="px-4 py-1.5 bg-purple-600 text-white rounded-lg font-semibold text-sm hover:bg-purple-700 disabled:opacity-40 transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Export{" "}
              {checkedJobs.size > 0 ? `(${checkedJobs.size})` : ""}
            </button>
            <button
              onClick={cancelExport}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Vehicle Export Banner ── */}
      {vehicleExportMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-semibold text-blue-800 text-sm">
                Select vehicles to export as one PDF
              </p>
              <p className="text-xs text-blue-500">
                {checkedVehicles.size} vehicle
                {checkedVehicles.size !== 1 ? "s" : ""} selected
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={selectAllVehicles}
              className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium"
            >
              Select All
            </button>
            <button
              onClick={clearAllVehicles}
              className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Clear
            </button>
            <button
              onClick={() =>
                checkedVehicles.size > 0 &&
                exportVehiclesPDF(Array.from(checkedVehicles))
              }
              disabled={checkedVehicles.size === 0}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-40 transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Export{" "}
              {checkedVehicles.size > 0 ? `(${checkedVehicles.size})` : ""}
            </button>
            <button
              onClick={cancelExport}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Profit / Loss Banner ── */}
      {totals.totalBookings > 0 && (
        <div
          className={`rounded-2xl p-4 flex items-center gap-4 ${isProfit ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${isProfit ? "bg-green-100" : "bg-red-100"}`}
          >
            {isProfit ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600" />
            )}
          </div>
          <div>
            <p
              className={`font-bold text-lg ${isProfit ? "text-green-700" : "text-red-700"}`}
            >
              Overall {isProfit ? "Profit" : "Loss"}:{" "}
              {formatCurrency(Math.abs(totals.netProfit || 0))}
            </p>
            <p className="text-sm text-gray-500">
              Revenue {formatCurrency(totals.totalRevenue || 0)} − Expense{" "}
              {formatCurrency(totals.totalExpense || 0)} ={" "}
              {isProfit ? "Profit" : "Loss"}{" "}
              {formatCurrency(Math.abs(totals.netProfit || 0))}
            </p>
          </div>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Revenue",
            value: formatCurrency(totals.totalRevenue || 0),
            icon: IndianRupee,
            bg: "bg-green-100",
            ico: "text-green-600",
          },
          {
            label: "Total Expense",
            value: formatCurrency(totals.totalExpense || 0),
            icon: TrendingDown,
            bg: "bg-red-100",
            ico: "text-red-600",
          },
          {
            label: "Net Profit",
            value: formatCurrency(totals.netProfit || 0),
            icon: TrendingUp,
            bg: isProfit ? "bg-blue-100" : "bg-red-100",
            ico: isProfit ? "text-blue-600" : "text-red-600",
          },
          {
            label: "Total Jobs",
            value: String(totals.totalBookings || 0),
            icon: Truck,
            bg: "bg-purple-100",
            ico: "text-purple-600",
          },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <div
              className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}
            >
              <s.icon className={`w-5 h-5 ${s.ico}`} />
            </div>
            <div className="font-bold text-xl text-gray-900 font-display">
              {s.value}
            </div>
            <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      {vehicles.length > 0 && totals.totalBookings > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="section-title mb-4">
              Revenue vs Expense by Vehicle
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={vehicles.map((v) => ({
                  name: v.vehicleNumber.slice(-6),
                  Revenue: v.totalRevenue,
                  Expense: v.totalExpense,
                  Profit: Math.max(v.netProfit, 0),
                }))}
              >
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip formatter={(val: any) => formatCurrency(val)} />
                <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#f87171" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Profit" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-6">
            <h2 className="section-title mb-4">Cost Breakdown</h2>
            {pieData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                    >
                      {pieData.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: any) => formatCurrency(val)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {pieData.map((d) => (
                    <div
                      key={d.name}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: d.color }}
                      />
                      <span className="text-gray-600">{d.name}</span>
                      <span className="font-semibold ml-2">
                        {formatCurrency(d.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                No data yet
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {vehicles.length === 0 || totals.totalBookings === 0 ? (
        <div className="card p-16 text-center">
          <ClipboardList className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-gray-500 mb-2">
            No job entries yet
          </h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            Share the job completion form link with your drivers. When they fill
            it after each job, data will appear here automatically.
          </p>
        </div>
      ) : null}

      {/* ── Per Vehicle Cards ── */}
      {vehicles.map((v) => {
        const vProfit = v.netProfit >= 0;
        const isVehicleChecked = checkedVehicles.has(v.vehicleId);
        const vehicleJobIds = v.bookings.map((b) => b.id);
        const checkedJobsInVehicle = vehicleJobIds.filter((id) =>
          checkedJobs.has(id),
        );
        const allJobsInVehicleChecked =
          vehicleJobIds.length > 0 &&
          checkedJobsInVehicle.length === vehicleJobIds.length;

        return (
          <div
            key={v.vehicleId}
            className={`card overflow-hidden transition-all ${vehicleExportMode && isVehicleChecked ? "ring-2 ring-blue-500" : ""} ${jobExportMode && checkedJobsInVehicle.length > 0 ? "ring-2 ring-purple-400" : ""}`}
          >
            {/* Vehicle Header */}
            <div className="p-5 flex items-center justify-between border-b border-gray-100 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                {vehicleExportMode && (
                  <button
                    onClick={() => toggleVehicle(v.vehicleId)}
                    className="flex-shrink-0"
                  >
                    {isVehicleChecked ? (
                      <CheckSquare className="w-6 h-6 text-blue-600" />
                    ) : (
                      <Square className="w-6 h-6 text-gray-300 hover:text-gray-400" />
                    )}
                  </button>
                )}
                {/* Job-mode: select all jobs in this vehicle */}
                {jobExportMode && (
                  <button
                    onClick={() => {
                      if (allJobsInVehicleChecked) {
                        setCheckedJobs((prev) => {
                          const next = new Set(prev);
                          vehicleJobIds.forEach((id) => next.delete(id));
                          return next;
                        });
                      } else {
                        setCheckedJobs((prev) => {
                          const next = new Set(prev);
                          vehicleJobIds.forEach((id) => next.add(id));
                          return next;
                        });
                      }
                    }}
                    className="flex-shrink-0"
                    title={
                      allJobsInVehicleChecked
                        ? "Deselect all jobs for this vehicle"
                        : "Select all jobs for this vehicle"
                    }
                  >
                    {allJobsInVehicleChecked ? (
                      <CheckSquare className="w-6 h-6 text-purple-600" />
                    ) : checkedJobsInVehicle.length > 0 ? (
                      <CheckSquare className="w-6 h-6 text-purple-300" />
                    ) : (
                      <Square className="w-6 h-6 text-gray-300 hover:text-gray-400" />
                    )}
                  </button>
                )}
                <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{v.vehicleNumber}</h3>
                  <p className="text-sm text-gray-500">
                    {v.vehicleType}
                    <span className="mx-1.5 text-gray-300">•</span>
                    <span
                      className={v.isActive ? "text-green-600" : "text-red-500"}
                    >
                      {v.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="mx-1.5 text-gray-300">•</span>
                    {v.totalBookings} job{v.totalBookings !== 1 ? "s" : ""}
                    {jobExportMode && checkedJobsInVehicle.length > 0 && (
                      <span className="ml-2 text-purple-600 font-semibold">
                        ({checkedJobsInVehicle.length} selected)
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-full ${vProfit ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {vProfit ? "▲ PROFIT" : "▼ LOSS"}{" "}
                  {formatCurrency(Math.abs(v.netProfit))}
                </span>
                <button
                  onClick={() => exportVehiclesPDF([v.vehicleId])}
                  className="btn-secondary text-sm py-2 px-3 flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Export
                </button>
              </div>
            </div>

            {/* Vehicle Summary Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y md:divide-y-0 divide-gray-100">
              {[
                {
                  label: "Total Revenue",
                  value: formatCurrency(v.totalRevenue),
                  cls: "text-green-600",
                  bg: "bg-green-50",
                },
                {
                  label: "Fuel Expense",
                  value: formatCurrency(v.totalFuel),
                  cls: "text-orange-600",
                  bg: "bg-orange-50",
                },
                {
                  label: "Driver Salary",
                  value: formatCurrency(v.totalSalary),
                  cls: "text-purple-600",
                  bg: "bg-purple-50",
                },
                {
                  label: v.netProfit >= 0 ? "Net Profit" : "Net Loss",
                  value: formatCurrency(Math.abs(v.netProfit)),
                  cls: vProfit ? "text-blue-600" : "text-red-600",
                  bg: vProfit ? "bg-blue-50" : "bg-red-50",
                },
              ].map((item) => (
                <div key={item.label} className={`${item.bg} p-4 text-center`}>
                  <div className={`font-bold text-lg ${item.cls}`}>
                    {item.value}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Profit/Loss bar */}
            {v.totalRevenue > 0 && (
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                  <span>
                    Expense ratio:{" "}
                    {((v.totalExpense / v.totalRevenue) * 100).toFixed(1)}%
                  </span>
                  <span>
                    {vProfit ? "✓ Profitable" : "⚠ Running at a loss"}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${vProfit ? "bg-green-500" : "bg-red-500"}`}
                    style={{
                      width: `${Math.min((v.netProfit / v.totalRevenue) * 100 + 50, 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-red-400">Loss</span>
                  <span className="text-green-500">Profit</span>
                </div>
              </div>
            )}

            {/* Job Submissions */}
            {v.bookings.length > 0 ? (
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-blue-500" />
                    Job Submissions ({v.bookings.length})
                    {jobExportMode && (
                      <span className="text-xs font-normal text-purple-500 ml-1">
                        — check jobs to include in PDF
                      </span>
                    )}
                  </h4>
                  <button
                    onClick={() =>
                      setExpandedVehicle(
                        expandedVehicle === v.vehicleId ? null : v.vehicleId,
                      )
                    }
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                  >
                    {expandedVehicle === v.vehicleId ? (
                      <>
                        <ChevronUp className="w-4 h-4" /> Collapse
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" /> View All
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2">
                  {(expandedVehicle === v.vehicleId || jobExportMode
                    ? v.bookings
                    : v.bookings.slice(0, 3)
                  ).map((b) => {
                    const net =
                      b.cost - b.fuelExpense - b.driverSalary - b.otherExpense;
                    const jobProfit = net >= 0;
                    const isJobChecked = checkedJobs.has(b.id);

                    return (
                      <div
                        key={b.id}
                        onClick={() => jobExportMode && toggleJob(b.id)}
                        className={`bg-gray-50 rounded-xl p-4 border transition-colors
                          ${jobExportMode ? "cursor-pointer" : ""}
                          ${
                            jobExportMode && isJobChecked
                              ? "border-purple-400 bg-purple-50 ring-1 ring-purple-300"
                              : "border-gray-100 hover:bg-gray-100"
                          }`}
                      >
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Per-job checkbox */}
                            {jobExportMode && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleJob(b.id);
                                }}
                                className="flex-shrink-0"
                              >
                                {isJobChecked ? (
                                  <CheckSquare className="w-5 h-5 text-purple-600" />
                                ) : (
                                  <Square className="w-5 h-5 text-gray-300 hover:text-gray-400" />
                                )}
                              </button>
                            )}
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <MapPin className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800 text-sm">
                                {b.area}
                              </div>
                              <div className="text-xs text-gray-400">
                                {b.completedAt
                                  ? new Date(b.completedAt).toLocaleString(
                                      "en-IN",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )
                                  : "—"}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="text-center">
                              <div className="text-xs text-gray-400">
                                Revenue
                              </div>
                              <div className="font-bold text-green-600 text-sm">
                                {formatCurrency(b.cost)}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-400 flex items-center gap-0.5">
                                <Fuel className="w-3 h-3 text-orange-400" />{" "}
                                Fuel
                              </div>
                              <div className="text-orange-500 text-sm font-medium">
                                {formatCurrency(b.fuelExpense)}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-400 flex items-center gap-0.5">
                                <User className="w-3 h-3 text-purple-400" />{" "}
                                Salary
                              </div>
                              <div className="text-purple-500 text-sm font-medium">
                                {formatCurrency(b.driverSalary)}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-400">Net</div>
                              <div
                                className={`font-bold text-sm ${jobProfit ? "text-blue-600" : "text-red-600"}`}
                              >
                                {formatCurrency(net)}
                              </div>
                            </div>
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded-full ${jobProfit ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                            >
                              {jobProfit ? "Profit" : "Loss"}
                            </span>
                          </div>
                        </div>
                        {b.notes && (
                          <div className="mt-2 flex items-start gap-1.5 text-xs text-gray-500">
                            <FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
                            {b.notes}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {v.bookings.length > 3 &&
                    expandedVehicle !== v.vehicleId &&
                    !jobExportMode && (
                      <button
                        onClick={() => setExpandedVehicle(v.vehicleId)}
                        className="w-full py-2.5 text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                      >
                        +{v.bookings.length - 3} more jobs — Click to expand
                      </button>
                    )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <ClipboardList className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">
                  No jobs recorded yet for this vehicle.
                </p>
                <p className="text-gray-300 text-xs mt-1">
                  Share the booking form link with your driver.
                </p>
              </div>
            )}
          </div>
        );
      })}

      {/* Floating job export fab when jobs selected */}
      {jobExportMode && checkedJobs.size > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => exportJobsPDF(Array.from(checkedJobs))}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-2xl shadow-2xl font-bold text-sm hover:bg-purple-700 transition-all hover:scale-105"
          >
            <Download className="w-5 h-5" />
            Export {checkedJobs.size} Job{checkedJobs.size !== 1 ? "s" : ""} as
            PDF
          </button>
        </div>
      )}
    </div>
  );
}
