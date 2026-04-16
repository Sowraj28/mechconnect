"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Search,
  MapPin,
  Phone,
  MessageSquare,
  Star,
  Truck,
  CheckCircle2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

function StarRating({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4",
            i <= rating
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-200 fill-gray-200",
          )}
        />
      ))}
    </div>
  );
}

function ReviewModal({
  vehicle,
  onClose,
}: {
  vehicle: any;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleId: vehicle.id, rating, comment }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (data.success) {
      toast.success("Review submitted!");
      onClose();
    } else toast.error(data.error);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Write a Review</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          {vehicle.vehicleNumber} - {vehicle.driver?.name}
        </p>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} onClick={() => setRating(i)}>
              <Star
                className={cn(
                  "w-8 h-8",
                  i <= rating
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-200",
                )}
              />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          className="input-field h-28 resize-none mb-4"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {submitting && (
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            )}
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState(searchParams.get("city") || "");
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("service") || "",
  );
  const [reviewTarget, setReviewTarget] = useState<any>(null);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchVehicles();
  }, [searchParams]);

  async function fetchVehicles() {
    setLoading(true);
    try {
      const city = searchParams.get("city") || "";
      const service = searchParams.get("service") || "";
      const params = new URLSearchParams();
      if (city) params.set("city", city);
      if (service) params.set("service", service);
      const res = await fetch(`/api/vehicles/search?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity) params.set("city", searchCity);
    if (searchQuery) params.set("service", searchQuery);
    router.push(`/user/search?${params.toString()}`);
  }

  function handleCall(e: React.MouseEvent, v: any) {
    e.stopPropagation();
    if (!session) {
      toast("Please login to contact operators", { icon: "🔒" });
      router.push("/auth/login");
      return;
    }
    window.open(`tel:${v.driver?.phone}`, "_blank");
  }

  function handleMessage(e: React.MouseEvent, v: any) {
    e.stopPropagation();
    if (!session) {
      toast("Please login to contact operators", { icon: "🔒" });
      router.push("/auth/login");
      return;
    }
    const msg = `Hi, I found your service on MechConnect. Vehicle: ${v.vehicleNumber}. I would like to enquire about booking this vehicle.`;
    window.open(
      `https://wa.me/91${v.driver?.phone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  }

  function handleReview(e: React.MouseEvent, v: any) {
    e.stopPropagation();
    if (!session) {
      toast("Please login to leave a review", { icon: "🔒" });
      router.push("/auth/login");
      return;
    }
    setReviewTarget(v);
  }

  const sorted = [...vehicles].sort((a, b) => {
    if (sortBy === "rating") {
      const aR =
        a.reviews?.reduce((s: number, r: any) => s + r.rating, 0) /
        (a.reviews?.length || 1);
      const bR =
        b.reviews?.reduce((s: number, r: any) => s + r.rating, 0) /
        (b.reviews?.length || 1);
      return bR - aR;
    }
    return 0;
  });

  const cityName = searchParams.get("city") || "All Cities";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-card p-4 mb-6">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search JCB, Crane, Tipper, Loader, Sewage..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200">
            <MapPin className="w-5 h-5 text-purple-500" />
            <input
              type="text"
              placeholder="City..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="w-32 bg-transparent outline-none text-gray-800 text-sm"
            />
          </div>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Search className="w-4 h-4" /> Search
          </button>
        </form>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-xl text-gray-900">
            Heavy Vehicles & Equipment in{" "}
            <span className="text-purple-600">{cityName}</span>
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {sorted.length} operator{sorted.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input-field w-auto text-sm py-2"
        >
          <option value="newest">Newest First</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20">
          <Truck className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-bold text-xl text-gray-500">No vehicles found</h3>
          <p className="text-gray-400 mt-2">
            Try searching in a different city or with different keywords
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((v: any) => {
            const avgRating = v.reviews?.length
              ? v.reviews.reduce((s: number, r: any) => s + r.rating, 0) /
                v.reviews.length
              : 0;

            return (
              <div
                key={v.id}
                className="card p-5 hover:shadow-card-hover transition-all duration-300 cursor-pointer"
                onClick={() => router.push(`/user/vehicle/${v.id}`)}
              >
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Photo */}
                  <div className="w-full lg:w-40 h-40 lg:h-32 bg-purple-50 rounded-xl overflow-hidden flex-shrink-0 relative">
                    {v.photos?.[0] ? (
                      <img
                        src={v.photos[0]}
                        alt={v.vehicleNumber}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Truck className="w-12 h-12 text-purple-300" />
                      </div>
                    )}
                    {v.driver?.isVerified && (
                      <div className="absolute top-2 right-2 bg-green-500 rounded-full p-0.5">
                        <CheckCircle2 className="w-4 h-4 text-white fill-white" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display font-bold text-lg text-gray-900 hover:text-purple-600 transition-colors">
                          {v.driver?.orgType === "ORGANIZATION"
                            ? v.driver?.orgName
                            : v.driver?.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {v.driver?.isVerified && (
                            <span className="badge-success text-xs">
                              Verified
                            </span>
                          )}
                          <span className="badge-info text-xs">
                            {v.vehicleType}
                          </span>
                          <span className="text-xs text-gray-400">
                            {v.vehicleNumber}
                          </span>
                          {(v.bookingCount ?? 0) > 0 && (
                            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                              ✓ {v.bookingCount} jobs done
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 justify-end">
                          <StarRating rating={Math.round(avgRating)} />
                          <span className="text-sm font-bold text-gray-900">
                            {avgRating.toFixed(1)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {v.reviews?.length || 0} reviews
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 text-sm">
                      <div className="text-gray-600">
                        <span className="font-medium">Type:</span>{" "}
                        {v.vehicleType}
                      </div>
                      <div className="text-gray-600">
                        <span className="font-medium">Capacity:</span>{" "}
                        {v.capacity}
                      </div>
                      {v.driver?.city && (
                        <div className="text-gray-600 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-purple-500" />
                          {v.driver.city}
                        </div>
                      )}
                    </div>

                    {v.description && (
                      <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                        {v.description}
                      </p>
                    )}

                    {v.services?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {v.services.slice(0, 4).map((s: string) => (
                          <span
                            key={s}
                            className="text-xs bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full font-medium"
                          >
                            {s}
                          </span>
                        ))}
                        {v.services.length > 4 && (
                          <span className="text-xs text-gray-400">
                            +{v.services.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {v.serviceAreas?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {v.serviceAreas.slice(0, 5).map((a: string) => (
                          <span
                            key={a}
                            className="text-xs bg-purple-50 text-purple-600 px-2.5 py-0.5 rounded-full font-medium"
                          >
                            {a}
                          </span>
                        ))}
                        {v.serviceAreas.length > 5 && (
                          <span className="text-xs text-gray-400">
                            +{v.serviceAreas.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    {v.reviews?.[0]?.comment && (
                      <div className="mt-3 bg-gray-50 rounded-xl p-3 text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <StarRating rating={v.reviews[0].rating} />
                          <span className="text-gray-500 text-xs">
                            - {v.reviews[0].user?.name}
                          </span>
                        </div>
                        <p className="text-gray-600 line-clamp-1">
                          "{v.reviews[0].comment}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row lg:flex-col gap-2 lg:w-36 flex-shrink-0">
                    <button
                      onClick={(e) => handleCall(e, v)}
                      className="flex-1 lg:flex-none bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Phone className="w-4 h-4" />{" "}
                      {session ? "Call Now" : "Login to Call"}
                    </button>
                    <button
                      onClick={(e) => handleMessage(e, v)}
                      className="flex-1 lg:flex-none bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <MessageSquare className="w-4 h-4" /> WhatsApp
                    </button>
                    <button
                      onClick={(e) => handleReview(e, v)}
                      className="flex-1 lg:flex-none bg-gray-100 hover:bg-yellow-50 hover:text-yellow-600 text-gray-600 font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Star className="w-4 h-4" /> Review
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/user/vehicle/${v.id}`);
                      }}
                      className="flex-1 lg:flex-none bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reviewTarget && (
        <ReviewModal
          vehicle={reviewTarget}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
