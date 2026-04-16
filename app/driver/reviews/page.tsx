"use client";

import { useEffect, useState, useRef } from "react";
import {
  Star,
  MessageSquare,
  Quote,
  TrendingUp,
  Award,
  Users,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// ─── Animated Star Rating ─────────────────────────────────────────────────────
function StarRating({
  rating,
  size = "md",
  animated = false,
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}) {
  const [filled, setFilled] = useState(animated ? 0 : rating);

  useEffect(() => {
    if (!animated) return;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setFilled(i);
      if (i >= rating) clearInterval(timer);
    }, 120);
    return () => clearInterval(timer);
  }, [rating, animated]);

  const sz =
    size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-6 h-6" : "w-4.5 h-4.5";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sz} transition-all duration-300 ${
            i <= filled
              ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]"
              : "text-gray-200 fill-gray-100"
          }`}
          style={{ transitionDelay: animated ? `${i * 80}ms` : "0ms" }}
        />
      ))}
    </div>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedNumber({
  value,
  decimals = 0,
}: {
  value: number;
  decimals?: number;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(parseFloat((eased * value).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, decimals]);

  return <span ref={ref}>{display.toFixed(decimals)}</span>;
}

// ─── Review Card ──────────────────────────────────────────────────────────────
function ReviewCard({ review, index }: { review: any; index: number }) {
  const initials =
    review.user?.name
      ?.split(" ")
      .map((w: string) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  // Generate a consistent avatar gradient based on name
  const gradients = [
    "from-blue-400 to-purple-600",
    "from-sky-400 to-purple-500",
    "from-blue-500 to-indigo-600",
    "from-cyan-400 to-blue-500",
    "from-blue-300 to-sky-500",
  ];
  const grad = gradients[review.user?.name?.length % gradients.length || 0];

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-blue-100 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(59,130,246,0.12)] hover:-translate-y-1"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-purple-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Quote watermark */}
      <div className="absolute top-4 right-5 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity duration-500">
        <Quote className="w-16 h-16 text-purple-900 fill-purple-900" />
      </div>

      <div className="p-6 relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className={`w-11 h-11 bg-gradient-to-br ${grad} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0`}
            >
              {initials}
            </div>

            <div>
              <div className="font-semibold text-gray-900 text-sm leading-tight">
                {review.user?.name || "Anonymous"}
              </div>
              <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                <span>{formatDate(review.createdAt)}</span>
                {review.vehicle?.vehicleNumber && (
                  <>
                    <span className="w-1 h-1 bg-gray-300 rounded-full inline-block" />
                    <span className="font-mono text-purple-500 font-medium">
                      {review.vehicle.vehicleNumber}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Rating pill */}
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-xl px-3 py-1.5 flex-shrink-0">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-sm font-bold text-amber-700">
              {review.rating}.0
            </span>
          </div>
        </div>

        {/* Stars */}
        <StarRating rating={review.rating} size="sm" />

        {/* Comment */}
        {review.comment && (
          <p className="mt-4 text-sm text-gray-600 leading-relaxed border-l-2 border-blue-100 pl-3">
            {review.comment}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DriverReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((d) => {
        setReviews(Array.isArray(d) ? d : []);
        setLoading(false);
      });
  }, []);

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const dist = [5, 4, 3, 2, 1].map((r) => ({
    stars: r,
    count: reviews.filter((rv) => rv.rating === r).length,
    pct: reviews.length
      ? (reviews.filter((rv) => rv.rating === r).length / reviews.length) * 100
      : 0,
  }));

  const fiveStarPct = reviews.length
    ? Math.round(
        (reviews.filter((r) => r.rating === 5).length / reviews.length) * 100,
      )
    : 0;

  const filtered = filter
    ? reviews.filter((r) => r.rating === filter)
    : reviews;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ── Page Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Customer Reviews
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              What your customers say about your service
            </p>
          </div>
          {!loading && reviews.length > 0 && (
            <div className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl shadow-lg shadow-blue-200">
              <Award className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {fiveStarPct}% 5-star
              </span>
            </div>
          )}
        </div>

        {/* ── Hero Stats Block ── */}
        {!loading && reviews.length > 0 && (
          <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 rounded-3xl p-8 overflow-hidden shadow-2xl shadow-blue-200">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-20 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,255,255,0.08),transparent_60%)]" />

            <div className="relative grid sm:grid-cols-2 gap-8 items-center">
              {/* Left — big score */}
              <div className="text-center sm:text-left">
                <div className="inline-flex items-end gap-2">
                  <span className="text-8xl font-black text-white leading-none tracking-tighter">
                    <AnimatedNumber value={avgRating} decimals={1} />
                  </span>
                  <span className="text-2xl text-blue-200 mb-3 font-light">
                    /5
                  </span>
                </div>
                <div className="flex justify-center sm:justify-start mt-3">
                  <StarRating
                    rating={Math.round(avgRating)}
                    size="lg"
                    animated
                  />
                </div>
                <p className="text-purple-200 text-sm mt-3 font-medium">
                  Based on{" "}
                  <span className="text-white font-bold">{reviews.length}</span>{" "}
                  customer review{reviews.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Right — distribution bars */}
              <div className="space-y-2.5">
                {dist.map((d) => (
                  <button
                    key={d.stars}
                    onClick={() =>
                      setFilter(filter === d.stars ? null : d.stars)
                    }
                    className={`w-full flex items-center gap-3 group/bar transition-all duration-200 ${
                      filter === d.stars
                        ? "opacity-100"
                        : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center gap-1 w-12 flex-shrink-0">
                      <span className="text-white text-xs font-semibold">
                        {d.stars}
                      </span>
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    </div>
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 delay-300 ${
                          filter === d.stars
                            ? "bg-amber-400"
                            : "bg-white/50 group-hover/bar:bg-amber-300"
                        }`}
                        style={{ width: `${d.pct}%` }}
                      />
                    </div>
                    <span className="text-blue-200 text-xs w-6 text-right flex-shrink-0 font-medium">
                      {d.count}
                    </span>
                  </button>
                ))}
                {filter && (
                  <button
                    onClick={() => setFilter(null)}
                    className="text-xs text-purple-200 hover:text-white underline transition-colors mt-1 block w-full text-right"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Stat Pills Row ── */}
        {!loading && reviews.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                icon: Users,
                value: reviews.length,
                label: "Total Reviews",
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "border-blue-100",
              },
              {
                icon: TrendingUp,
                value: `${fiveStarPct}%`,
                label: "5-Star Rate",
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                border: "border-emerald-100",
              },
              {
                icon: Star,
                value: avgRating.toFixed(1),
                label: "Avg Rating",
                color: "text-amber-600",
                bg: "bg-amber-50",
                border: "border-amber-100",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`${s.bg} border ${s.border} rounded-2xl p-4 flex items-center gap-3`}
              >
                <div className={`${s.bg} rounded-xl p-2 border ${s.border}`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <div className={`text-xl font-bold ${s.color}`}>
                    {s.value}
                  </div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Filter indicator ── */}
        {filter && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex">
              {[...Array(filter)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 text-amber-400 fill-amber-400"
                />
              ))}
            </div>
            <span className="font-medium">
              Showing {filtered.length} review{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 bg-gray-200 rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-3 w-28 bg-gray-200 rounded" />
                    <div className="h-2 w-20 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="h-2 w-24 bg-gray-200 rounded mb-3" />
                <div className="space-y-2">
                  <div className="h-2 bg-gray-100 rounded w-full" />
                  <div className="h-2 bg-gray-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && reviews.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-20 text-center">
            <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <MessageSquare className="w-10 h-10 text-purple-300" />
            </div>
            <h3 className="font-bold text-gray-700 text-lg">No reviews yet</h3>
            <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto leading-relaxed">
              Deliver great service and your customers' reviews will appear here
            </p>
            <div className="flex justify-center mt-6">
              <div className="flex gap-0.5 opacity-30">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-7 h-7 text-amber-300 fill-amber-300"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Reviews Grid ── */}
        {!loading && filtered.length > 0 && (
          <div className="columns-1 sm:columns-2 gap-4 space-y-4">
            {filtered.map((r, i) => (
              <div key={r.id} className="break-inside-avoid">
                <ReviewCard review={r} index={i} />
              </div>
            ))}
          </div>
        )}

        {/* Filtered empty */}
        {!loading && reviews.length > 0 && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No {filter}-star reviews yet</p>
            <button
              onClick={() => setFilter(null)}
              className="text-purple-500 text-sm mt-2 underline"
            >
              View all reviews
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
