import { useState, useEffect } from "react";
import { Heart, Calendar, Clock, CheckCircle, ArrowRight, TrendingUp, Sparkles, AlertCircle, ShieldCheck, Plus } from "lucide-react";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { Input } from "../components/common/Input";
import { Label } from "../components/common/Label";
import { Textarea } from "../components/common/Textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/common/Dialog";
import { api } from "../services/ApiService";
import { formatINR } from "../utils/currency";
import { toast } from "sonner";
import { useSearch } from "../context/SearchContext";

interface CheckupPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  tests: number;
  popular: boolean;
  includes: string[];
}

interface CheckupBooking {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  status: string;
  fee?: number;
}

const timeSlots = [
  "08:00 AM",
  "09:30 AM",
  "11:00 AM",
  "01:30 PM",
  "03:30 PM",
  "05:00 PM",
];

export function PatientHealthCheckups() {
  const { searchQuery } = useSearch();
  const [packages, setPackages] = useState<CheckupPackage[]>([]);
  const [bookings, setBookings] = useState<CheckupBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [selectedPackage, setSelectedPackage] = useState<CheckupPackage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(tomorrow);
  const [selectedSlot, setSelectedSlot] = useState("09:30 AM");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [notes, setNotes] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pkgRes, bookRes] = await Promise.all([
        api.get<{ packages: CheckupPackage[] }>("/checkups").catch(() => ({ packages: [] })),
        api.get<{ bookings: CheckupBooking[] }>("/checkups/bookings").catch(() => ({ bookings: [] })),
      ]);

      if (pkgRes?.packages?.length) {
        setPackages(pkgRes.packages);
      }
      if (bookRes?.bookings) {
        setBookings(bookRes.bookings);
      }
    } catch (error) {
      console.error("Failed to load checkups:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenBooking = (pkg: CheckupPackage) => {
    setSelectedPackage(pkg);
    setSelectedDate(tomorrow);
    setSelectedSlot("09:30 AM");
    setNotes("");
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;

    try {
      setIsSubmitting(true);
      const res = await api.post<{ success: boolean; message: string; booking: CheckupBooking }>("/checkups/book", {
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        selectedDate,
        selectedSlot,
        paymentMethod,
        notes,
      });

      toast.success(res.message || `Checkup "${selectedPackage.name}" scheduled successfully!`);
      setIsModalOpen(false);
      
      // Update bookings list dynamically
      if (res.booking) {
        setBookings(prev => [res.booking, ...prev]);
      } else {
        fetchData();
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to book checkup package.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const q = searchQuery.toLowerCase().trim();
  const filteredPackages = packages.filter((pkg) => {
    if (!q) return true;
    return (
      pkg.name.toLowerCase().includes(q) ||
      pkg.description.toLowerCase().includes(q) ||
      pkg.includes.some((item) => item.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Health Score Overview */}
      <Card className="p-6 bg-white border border-slate-200/80 rounded-xl shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-center shrink-0 dark:bg-teal-950/40 dark:border-teal-800">
              <div>
                <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">88</p>
                <p className="text-[10px] uppercase font-semibold text-teal-600 tracking-wider">Score</p>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Optimal Vitality</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Preventive Health Assessment</h3>
              <p className="text-xs text-slate-500 mt-0.5 dark:text-slate-400">
                Calculated from your previous laboratory panels, vitals tracking, and lifestyle metrics.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: "Cardiac Risk", score: "Low", status: "emerald" },
              { name: "Metabolic Index", score: "Normal", status: "teal" },
              { name: "Blood Glucose", score: "94 mg/dL", status: "emerald" },
              { name: "Lipid Profile", score: "Balanced", status: "teal" },
            ].map((metric) => (
              <div key={metric.name} className="p-3 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800 text-center">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{metric.name}</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{metric.score}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Upcoming / Booked Checkups */}
      {bookings.length > 0 && (
        <Card className="p-6 bg-white border border-slate-200/80 rounded-xl shadow-xs dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">Your Scheduled Checkups</h2>
            <Badge variant="success">{bookings.length} Active</Badge>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {bookings.map((booking) => (
              <div key={booking.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-700 shrink-0 dark:bg-teal-950/40 dark:text-teal-300">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{booking.name}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {booking.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {booking.time}
                      </span>
                      <span>•</span>
                      <span>{booking.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-center">
                  <Badge variant="success">{booking.status || "confirmed"}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Available Health Packages */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Available Health Packages</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Select a clinical package tailored to your preventive healthcare profile</p>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 bg-slate-100 animate-pulse rounded-xl border border-slate-200" />
            ))}
          </div>
        ) : filteredPackages.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {filteredPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`p-6 bg-white border rounded-xl shadow-xs transition-all relative flex flex-col justify-between dark:bg-slate-900 ${
                  pkg.popular
                    ? "border-teal-400/80 ring-1 ring-teal-400/30"
                    : "border-slate-200/80"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{pkg.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed dark:text-slate-400">{pkg.description}</p>
                    </div>
                    {pkg.popular && (
                      <span className="px-2.5 py-0.5 bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-semibold rounded-full shrink-0 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800">
                        Most Popular
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1.5 mb-4">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">{formatINR(pkg.price)}</span>
                    <span className="text-xs text-slate-400 font-medium">all inclusive</span>
                  </div>

                  <div className="flex items-center gap-4 mb-4 pb-3 border-b border-slate-100 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{pkg.duration}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                      <span>{pkg.tests} Comprehensive Tests</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider dark:text-slate-300">Key Diagnostic Parameters:</p>
                    <ul className="grid grid-cols-1 gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      {pkg.includes.map((test, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-teal-600 mt-0.5 shrink-0" />
                          <span>{test}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Button
                  onClick={() => handleOpenBooking(pkg)}
                  className={`w-full h-10 rounded-lg text-xs font-medium shadow-xs transition-all ${
                    pkg.popular
                      ? "bg-teal-600 hover:bg-teal-700 text-white"
                      : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                  }`}
                >
                  Book Checkup ({formatINR(pkg.price)})
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center border border-slate-200/80 bg-white dark:bg-slate-900 rounded-xl">
            <p className="text-sm text-slate-500">No health checkup packages found matching "{searchQuery}".</p>
          </Card>
        )}
      </div>

      {/* Booking Confirmation Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[460px] rounded-2xl bg-white border border-slate-200 shadow-xl dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-white">Schedule Health Checkup</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Confirm your booking details for {selectedPackage?.name}.
            </DialogDescription>
          </DialogHeader>

          {selectedPackage && (
            <form onSubmit={handleConfirmBooking} className="space-y-4 py-2 text-sm">
              <div className="p-3 rounded-lg bg-teal-50/60 border border-teal-200/60 flex items-center justify-between text-xs dark:bg-teal-950/30 dark:border-teal-900/50">
                <div>
                  <p className="font-semibold text-teal-900 dark:text-teal-200">{selectedPackage.name}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">{selectedPackage.tests} Tests • {selectedPackage.duration}</p>
                </div>
                <span className="text-base font-bold text-teal-800 dark:text-teal-300">{formatINR(selectedPackage.price)}</span>
              </div>

              {/* Date Selection */}
              <div className="space-y-1.5">
                <Label htmlFor="checkup-date" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Checkup Date
                </Label>
                <Input
                  id="checkup-date"
                  type="date"
                  min={tomorrow}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-10 rounded-lg border-slate-200 text-xs bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700"
                  required
                />
              </div>

              {/* Slot Selection */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Arrival Slot
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`h-9 px-2 text-xs font-medium rounded-lg border transition-all ${
                        selectedSlot === slot
                          ? "bg-teal-600 text-white border-teal-600 shadow-xs font-semibold"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Payment Method
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "upi", label: "UPI Pay" },
                    { id: "card", label: "Credit/Debit Card" },
                    { id: "wallet", label: "Hospital Desk" },
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`h-9 px-2 text-xs font-medium rounded-lg border transition-all ${
                        paymentMethod === method.id
                          ? "bg-teal-50 border-teal-300 text-teal-900 font-semibold dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Medical Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="checkup-notes" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Specific Health Concerns (Optional)
                </Label>
                <Textarea
                  id="checkup-notes"
                  placeholder="e.g. History of hypertension, fasting since last night..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="rounded-lg border-slate-200 text-xs bg-white text-slate-900 min-h-[60px] dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <DialogFooter className="pt-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-lg border-slate-200 text-xs"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium px-5 shadow-xs"
                >
                  {isSubmitting ? "Confirming..." : `Confirm Booking • ${formatINR(selectedPackage.price)}`}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

