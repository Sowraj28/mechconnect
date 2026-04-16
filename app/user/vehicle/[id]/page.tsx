"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Phone,
  MessageSquare,
  Star,
  MapPin,
  Truck,
  CheckCircle2,
  ArrowLeft,
  X,
  Shield,
  Wrench,
  Clock,
  ClipboardCheck,
} from "lucide-react";
import toast from "react-hot-toast";

function StarRating({
  rating,
  interactive = false,
  onRate,
}: {
  rating: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${interactive ? "w-7 h-7 cursor-pointer" : "w-4 h-4"} ${i <= (hover || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-100"} transition-colors`}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate?.(i)}
        />
      ))}
    </div>
  );
}

export default function VehicleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingCount, setBookingCount] = useState(0);

  const loadVehicle = () => {
    fetch(`/api/vehicles/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setVehicle(d);
        setBookingCount(d?._count?.bookings ?? d?.bookingCount ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadVehicle();
    const interval = setInterval(loadVehicle, 30000);
    return () => clearInterval(interval);
  }, [id]);

  function handleCall() {
    if (!session) {
      toast("Please login to contact", { icon: "🔒" });
      router.push("/auth/login");
      return;
    }
    window.open(`tel:${vehicle.driver?.phone}`);
  }

  function handleWhatsApp() {
    if (!session) {
      toast("Please login to contact", { icon: "🔒" });
      router.push("/auth/login");
      return;
    }
    const msg = `Hi, I found your service on MechConnect. Vehicle: ${vehicle.vehicleNumber}. I would like to enquire about booking this vehicle.`;
    window.open(
      `https://wa.me/91${vehicle.driver?.phone?.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`,
    );
  }

  async function submitReview() {
    if (!session) {
      toast("Login to review", { icon: "🔒" });
      router.push("/auth/login");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleId: id, rating, comment }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (data.success) {
      toast.success("Review submitted!");
      setShowReview(false);
      loadVehicle();
    } else toast.error(data.error);
  }

  if (loading)
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-72 bg-gray-200 rounded-2xl" />
        <div className="h-10 bg-gray-200 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/3" />
      </div>
    );

  if (!vehicle)
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <Truck className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-500">Vehicle not found</h2>
        <Link href="/user/search" className="btn-primary mt-4 inline-block">
          Back to Search
        </Link>
      </div>
    );

  const avgRating = vehicle.reviews?.length
    ? vehicle.reviews.reduce((s: number, r: any) => s + r.rating, 0) /
      vehicle.reviews.length
    : 0;

  const allPhotos =
    vehicle.photos?.length > 0
      ? vehicle.photos
      : vehicle.images?.length > 0
        ? vehicle.images
        : ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"];

  const displayName =
    vehicle.driver?.orgType === "ORGANIZATION"
      ? vehicle.driver?.orgName || vehicle.driver?.name
      : vehicle.driver?.name;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-purple-600 mb-5 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Results
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-5">
          {/* Photo Gallery */}
          <div className="card overflow-hidden">
            <div className="relative h-72 bg-gray-100">
              <img
                src={allPhotos[activePhoto]}
                alt="vehicle"
                className="w-full h-full object-cover"
              />
              {vehicle.driver?.isVerified && (
                <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Operator
                </div>
              )}
              <div className="absolute top-3 right-3 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                <ClipboardCheck className="w-3.5 h-3.5 text-green-400" />
                {bookingCount} job{bookingCount !== 1 ? "s" : ""} done
              </div>
            </div>
            {allPhotos.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto bg-gray-50">
                {allPhotos.map((p: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(i)}
                    className={`w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${activePhoto === i ? "border-purple-500" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    <img
                      src={p}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Name & Rating */}
          <div className="card p-6">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="font-display text-2xl font-bold text-gray-900">
                  {displayName}
                </h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {vehicle.driver?.isVerified && (
                    <span className="badge-success">✓ Verified</span>
                  )}
                  <span className="badge-info">{vehicle.vehicleType}</span>
                  <span className="text-sm text-gray-400">
                    {vehicle.vehicleNumber}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <StarRating rating={Math.round(avgRating)} />
                  <span className="font-bold text-xl text-gray-900">
                    {avgRating.toFixed(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  {vehicle.reviews?.length || 0} rating
                  {vehicle.reviews?.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600 border-t border-gray-100 pt-4">
              {vehicle.driver?.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-purple-500" />
                  {vehicle.driver.city}
                  {vehicle.driver.state ? `, ${vehicle.driver.state}` : ""}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-purple-500" /> Capacity:{" "}
                {vehicle.capacity}
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-green-600">
                <ClipboardCheck className="w-4 h-4" />
                {bookingCount} Booking{bookingCount !== 1 ? "s" : ""} Completed
              </span>
            </div>

            <div className="flex gap-3 mt-5 lg:hidden">
              <button
                onClick={handleCall}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-5 h-5" />
                {session ? "Call Now" : "Login to Call"}
              </button>
              <button
                onClick={handleWhatsApp}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-5 h-5" /> WhatsApp
              </button>
            </div>
          </div>

          {/* Services */}
          {vehicle.services?.length > 0 && (
            <div className="card p-6">
              <h2 className="font-display font-bold text-lg text-gray-900 mb-4">
                Services Offered
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vehicle.services.map((s: string) => (
                  <div
                    key={s}
                    className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl"
                  >
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Wrench className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">
                        {s}
                      </div>
                      <button
                        onClick={handleCall}
                        className="text-xs text-purple-600 hover:underline"
                      >
                        Enquire Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service Areas */}
          {vehicle.serviceAreas?.length > 0 && (
            <div className="card p-6">
              <h2 className="font-display font-bold text-lg text-gray-900 mb-4">
                Service Areas
              </h2>
              <div className="flex flex-wrap gap-2">
                {vehicle.serviceAreas.map((a: string) => (
                  <span
                    key={a}
                    className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    <MapPin className="w-3.5 h-3.5 text-purple-500" /> {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg text-gray-900">
                Customer Reviews
              </h2>
              <button
                onClick={() => setShowReview(true)}
                className="btn-secondary text-sm py-2 px-4 flex items-center gap-1.5"
              >
                <Star className="w-4 h-4" /> Write Review
              </button>
            </div>
            {vehicle.reviews?.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <Star className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No reviews yet. Be the first!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl mb-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold font-display text-gray-900">
                      {avgRating.toFixed(1)}
                    </div>
                    <StarRating rating={Math.round(avgRating)} />
                    <div className="text-xs text-gray-400 mt-1">
                      {vehicle.reviews.length} reviews
                    </div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((r) => {
                      const count = vehicle.reviews.filter(
                        (rv: any) => rv.rating === r,
                      ).length;
                      return (
                        <div
                          key={r}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span className="w-3 text-gray-500">{r}</span>
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400 rounded-full"
                              style={{
                                width: `${vehicle.reviews.length ? (count / vehicle.reviews.length) * 100 : 0}%`,
                              }}
                            />
                          </div>
                          <span className="text-gray-400 w-4">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {vehicle.reviews.map((r: any) => (
                  <div
                    key={r.id}
                    className="border-b border-gray-50 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-xs">
                          {r.user?.name?.charAt(0)}
                        </div>
                        <span className="font-semibold text-sm text-gray-900">
                          {r.user?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <StarRating rating={r.rating} />
                        <span className="text-xs text-gray-400 ml-1">
                          {new Date(r.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-gray-600 text-sm bg-gray-50 rounded-lg p-3">
                        {r.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN — Contact Card */}
        <div className="space-y-4">
          <div className="card p-6 sticky top-20">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {displayName?.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-gray-900">{displayName}</div>
                <div className="text-sm text-gray-500">
                  {vehicle.driver?.orgType === "ORGANIZATION"
                    ? "Organisation"
                    : "Individual"}
                </div>
                {vehicle.driver?.city && (
                  <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {vehicle.driver.city}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <button
                onClick={handleCall}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-5 h-5" />
                {session
                  ? vehicle.driver?.phone
                    ? `Call: ${vehicle.driver.phone}`
                    : "Call Now"
                  : "Login to Call"}
              </button>
              <button
                onClick={handleWhatsApp}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-5 h-5" /> Enquire on WhatsApp
              </button>
              <button
                onClick={() => setShowReview(true)}
                className="w-full bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors border border-yellow-200"
              >
                <Star className="w-4 h-4" /> Rate this Service
              </button>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
              <h3 className="font-semibold text-gray-700">Vehicle Details</h3>
              {[
                { label: "Vehicle No.", value: vehicle.vehicleNumber },
                { label: "Type", value: vehicle.vehicleType },
                { label: "Capacity", value: vehicle.capacity },
                { label: "Model", value: vehicle.model },
                { label: "Year", value: vehicle.year },
              ]
                .filter((i) => i.value)
                .map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-medium text-gray-900">
                      {item.value}
                    </span>
                  </div>
                ))}
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield className="w-4 h-4 text-green-500" /> Registered on
                MechConnect
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-50 px-3 py-2 rounded-xl border border-green-100">
                <ClipboardCheck className="w-4 h-4 text-green-500" />
                {bookingCount} booking{bookingCount !== 1 ? "s" : ""} completed
              </div>
              {vehicle.driver?.isVerified && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Identity
                  Verified
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-lg">
                Rate Your Experience
              </h3>
              <button onClick={() => setShowReview(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {displayName} — {vehicle.vehicleNumber}
            </p>
            <div className="flex gap-2 mb-5 justify-center">
              <StarRating rating={rating} interactive onRate={setRating} />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this service..."
              className="input-field h-28 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowReview(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
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
      )}
    </div>
  );
}
