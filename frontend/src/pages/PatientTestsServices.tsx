import { useState, useEffect } from "react";
import { 
  TestTube, 
  Calendar, 
  Clock, 
  MapPin, 
  IndianRupee, 
  CheckCircle2, 
  Home, 
  Building2, 
  ShoppingBag, 
  Sparkles,
  ArrowRight,
  Plus
} from "lucide-react";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Badge } from "../components/common/Badge";
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

interface LabTest {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: string;
  preparation: string;
  description: string;
}

interface TestBooking {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  status: string;
  fee?: number;
}

const timeSlots = [
  "07:30 AM",
  "09:00 AM",
  "10:30 AM",
  "01:00 PM",
  "03:30 PM",
  "05:30 PM",
];

const categoryList = [
  "All Tests",
  "Blood Tests",
  "Radiology",
  "Cardiac",
  "Imaging",
];

export function PatientTestsServices() {
  const { searchQuery } = useSearch();
  const [tests, setTests] = useState<LabTest[]>([]);
  const [bookings, setBookings] = useState<TestBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("All Tests");

  // Booking Modal State
  const [bookingTests, setBookingTests] = useState<LabTest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(tomorrow);
  const [selectedSlot, setSelectedSlot] = useState("09:00 AM");
  const [collectionType, setCollectionType] = useState<"home" | "clinic">("home");
  const [sampleAddress, setSampleAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [testRes, bookRes] = await Promise.all([
        api.get<{ tests: LabTest[] }>("/tests").catch(() => ({ tests: [] })),
        api.get<{ bookings: TestBooking[] }>("/tests/bookings").catch(() => ({ bookings: [] })),
      ]);

      if (testRes?.tests?.length) {
        setTests(testRes.tests);
      }
      if (bookRes?.bookings) {
        setBookings(bookRes.bookings);
      }
    } catch (error) {
      console.error("Failed to load tests and bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartBooking = (test: LabTest) => {
    setBookingTests([test]);
    setSelectedDate(tomorrow);
    setSelectedSlot("09:00 AM");
    setCollectionType("home");
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bookingTests.length === 0) return;

    try {
      setIsSubmitting(true);
      const testNames = bookingTests.map((t) => t.name);

      const res = await api.post<{ success: boolean; message: string; booking: TestBooking }>("/tests/book", {
        tests: testNames,
        testNames,
        collectionType,
        selectedDate,
        selectedSlot,
        sampleAddress: collectionType === "home" ? sampleAddress : "Hospital Pathology Lab",
        paymentMethod,
      });

      toast.success(res.message || "Diagnostic test booking confirmed!");
      setIsModalOpen(false);

      if (res.booking) {
        setBookings((prev) => [res.booking, ...prev]);
      } else {
        fetchData();
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to book diagnostic test.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTests = tests.filter((test) => {
    const matchesCategory = selectedCategory === "All Tests" || test.category.toLowerCase().includes(selectedCategory.toLowerCase().replace(" tests", ""));
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      test.name.toLowerCase().includes(q) ||
      test.description.toLowerCase().includes(q) ||
      test.category.toLowerCase().includes(q) ||
      (test.preparation && test.preparation.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const totalFee = bookingTests.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Category Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categoryList.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? "bg-teal-600 text-white border border-teal-600 shadow-xs font-semibold"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Scheduled / Upcoming Tests */}
      {bookings.length > 0 && (
        <Card className="p-6 bg-white border border-slate-200/80 rounded-xl shadow-xs dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">Your Scheduled Lab Tests</h2>
            <Badge variant="success">{bookings.length} Booked</Badge>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {bookings.map((booking) => (
              <div key={booking.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-700 shrink-0 dark:bg-teal-950/40 dark:text-teal-300">
                    <TestTube className="w-5 h-5" />
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
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {booking.location}
                      </span>
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

      {/* Available Tests Grid */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Diagnostic Catalog</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Select any diagnostic test for hospital center or home sample collection</p>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 bg-slate-100 animate-pulse rounded-xl border border-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredTests.map((test) => (
              <Card
                key={test.id}
                className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-xs transition-all hover:border-teal-500/40 hover:shadow-sm flex flex-col justify-between dark:bg-slate-900 dark:border-slate-800"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-700 shrink-0 dark:bg-teal-950/40 dark:text-teal-300">
                        <TestTube className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{test.name}</h3>
                        <span className="inline-block mt-0.5 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded dark:bg-slate-800 dark:text-slate-400">
                          {test.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-slate-900 dark:text-white">{formatINR(test.price)}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3.5 line-clamp-2">
                    {test.description}
                  </p>

                  <div className="flex items-center gap-4 py-2 border-y border-slate-100 text-[11px] text-slate-500 mb-3.5 dark:border-slate-800">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{test.duration}</span>
                    </div>
                    <span>•</span>
                    <span className="truncate">{test.preparation}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleStartBooking(test)}
                    className="flex-1 h-9 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-xs"
                  >
                    Schedule Test
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Diagnostic Service Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-xs dark:bg-slate-900 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-700 mb-2.5">
            <Home className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-50">Doorstep Phlebotomy</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Trained medical phlebotomists collect samples from your home safely.</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-xs dark:bg-slate-900 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700 mb-2.5">
            <Clock className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-50">Rapid Digital Reports</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Automated SMS and email delivery with clinical pathologist verification.</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-xs dark:bg-slate-900 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200/60 flex items-center justify-center text-sky-700 mb-2.5">
            <Building2 className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-50">Direct Clinic Access</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Walk into any MEDIrxCARE hospital counter with zero waiting time.</p>
        </div>
      </div>

      {/* Booking Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[460px] rounded-2xl bg-white border border-slate-200 shadow-xl dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-white">Schedule Diagnostic Test</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Select collection preference, slot, and confirm appointment details.
            </DialogDescription>
          </DialogHeader>

          {bookingTests.length > 0 && (
            <form onSubmit={handleConfirmBooking} className="space-y-4 py-2 text-sm">
              <div className="p-3 rounded-lg bg-teal-50/60 border border-teal-200/60 flex items-center justify-between text-xs dark:bg-teal-950/30 dark:border-teal-900/50">
                <div>
                  <p className="font-semibold text-teal-900 dark:text-teal-200">{bookingTests[0].name}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">{bookingTests[0].category} • {bookingTests[0].duration}</p>
                </div>
                <span className="text-base font-bold text-teal-800 dark:text-teal-300">{formatINR(totalFee)}</span>
              </div>

              {/* Sample Collection Mode */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Sample Collection Mode
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCollectionType("home")}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      collectionType === "home"
                        ? "bg-teal-50 border-teal-300 text-teal-900 dark:bg-teal-950/50 dark:border-teal-700 dark:text-teal-200"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
                    }`}
                  >
                    <Home className="w-4 h-4 shrink-0 text-teal-600" />
                    <div>
                      <p className="text-xs font-semibold">Home Collection</p>
                      <p className="text-[10px] text-slate-500">At your doorstep</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCollectionType("clinic")}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      collectionType === "clinic"
                        ? "bg-teal-50 border-teal-300 text-teal-900 dark:bg-teal-950/50 dark:border-teal-700 dark:text-teal-200"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
                    }`}
                  >
                    <Building2 className="w-4 h-4 shrink-0 text-slate-500" />
                    <div>
                      <p className="text-xs font-semibold">Clinic Visit</p>
                      <p className="text-[10px] text-slate-500">Hospital Lab Wing</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Home Address input if collectionType === 'home' */}
              {collectionType === "home" && (
                <div className="space-y-1.5">
                  <Label htmlFor="sample-address" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Sample Collection Address
                  </Label>
                  <Input
                    id="sample-address"
                    placeholder="Enter full address for sample pickup..."
                    value={sampleAddress}
                    onChange={(e) => setSampleAddress(e.target.value)}
                    className="h-10 rounded-lg border-slate-200 text-xs bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700"
                    required={collectionType === "home"}
                  />
                </div>
              )}

              {/* Date Selection */}
              <div className="space-y-1.5">
                <Label htmlFor="test-date" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Date
                </Label>
                <Input
                  id="test-date"
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
                  Select Time Slot
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
                    { id: "card", label: "Debit/Credit Card" },
                    { id: "cash", label: "Cash on Collection" },
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
                  {isSubmitting ? "Confirming..." : `Confirm Booking • ${formatINR(totalFee)}`}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

