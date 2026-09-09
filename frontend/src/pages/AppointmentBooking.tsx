import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  CreditCard,
  Landmark,
  QrCode,
  Smartphone,
  Star,
  User as UserIcon,
  Video,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Calendar } from "../components/common/Calendar";
import { DoctorService } from "../services/DoctorService";
import { appointmentService } from "../services/AppointmentService";
import { formatINR } from "../utils/currency";
import { getConsultationFee, PLATFORM_FEE } from "../utils/pricing";

const steps = [
  { id: 1, name: "Select Doctor" },
  { id: 2, name: "Choose Mode" },
  { id: 3, name: "Pick Slot" },
  { id: 4, name: "Payment" },
  { id: 5, name: "Confirmation" },
];

const timeSlots = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
];

const paymentOptions = [
  {
    value: "upi",
    title: "UPI / QR Scan",
    description: "Fastest checkout using UPI ID or any scanner app.",
    icon: QrCode,
    accent: "from-emerald-500 to-teal-500",
  },
  {
    value: "card",
    title: "Credit / Debit Card",
    description: "Pay securely with Visa, Mastercard, RuPay, or Amex.",
    icon: CreditCard,
    accent: "from-cyan-500 to-blue-500",
  },
  {
    value: "wallet",
    title: "Digital Wallet",
    description: "Use PhonePe, Google Pay, Paytm, or Amazon Pay.",
    icon: Smartphone,
    accent: "from-violet-500 to-fuchsia-500",
  },
  {
    value: "netbanking",
    title: "Other Digital Payment",
    description: "Net banking and additional online banking methods.",
    icon: Landmark,
    accent: "from-amber-500 to-orange-500",
  },
] as const;

const paymentLabels: Record<(typeof paymentOptions)[number]["value"], string> = {
  upi: "UPI / QR Scan",
  card: "Credit / Debit Card",
  wallet: "Digital Wallet",
  netbanking: "Other Digital Payment",
};

const qrPattern = [
  "111100001111",
  "100100001001",
  "101100001101",
  "111100001111",
  "000011110000",
  "110011001100",
  "001111110011",
  "111000111000",
  "000011110000",
  "111100001111",
  "100100001001",
  "111100001111",
];

export function AppointmentBooking() {
  const location = useLocation();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(location.state?.doctor ? 2 : 1);
  const [consultationType, setConsultationType] = useState<"online" | "offline">("online");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState("10:00 AM");
  const [selectedDoctor, setSelectedDoctor] = useState<any>(location.state?.doctor || null);
  const [reason, setReason] = useState("General consultation");
  const [paymentMethod, setPaymentMethod] = useState<(typeof paymentOptions)[number]["value"]>("upi");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingResult, setBookingResult] = useState<any>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await DoctorService.getAllDoctors();
        setDoctors(data);
        setSelectedDoctor((currentDoctor: any) => currentDoctor || data[0] || null);
      } catch (error) {
        console.error("Failed to load doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const doctor = selectedDoctor || {
    name: "Loading doctor...",
    specialty: "General Physician",
    experience: "0 years",
    rating: 0,
    onlineFee: 499,
    offlineFee: 799,
  };

  const consultationFee = getConsultationFee(doctor, consultationType);
  const totalAmount = consultationFee + PLATFORM_FEE;

  const handleContinue = async () => {
    if (currentStep < 4) {
      setCurrentStep((step) => step + 1);
      return;
    }

    if (!selectedDoctor || !selectedDate || !reason.trim()) {
      setBookingError("Please select a doctor, slot, and consultation reason.");
      return;
    }

    try {
      setIsBooking(true);
      setBookingError("");
      const doctorId = selectedDoctor.id || selectedDoctor._id;
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const mode = consultationType === "online" ? "Video" : "In-Person";

      const response = await appointmentService.book({
        doctorId,
        consultationType,
        mode,
        selectedDate: selectedDate.toISOString(),
        date: formattedDate,
        selectedSlot,
        timeSlot: selectedSlot,
        reason,
        paymentMethod,
        status: "confirmed",
      });
      setBookingResult(response.appointment);
      setCurrentStep(5);
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : "Failed to book appointment.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Card className="border border-slate-200/80 bg-white p-6 shadow-xs dark:bg-slate-900 dark:border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between gap-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full font-semibold transition-all ${
                    currentStep >= step.id
                      ? "bg-gradient-to-r from-cyan-600 to-teal-500 text-white shadow-lg shadow-cyan-500/20"
                      : "bg-gray-200 text-gray-500 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                </div>
                <p
                  className={`mt-2 text-xs font-medium ${
                    currentStep >= step.id ? "text-gray-900 dark:text-slate-100" : "text-gray-500 dark:text-slate-400"
                  }`}
                >
                  {step.name}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`-mx-2 h-1 flex-1 rounded-full ${
                    currentStep > step.id
                      ? "bg-gradient-to-r from-cyan-600 to-teal-500"
                      : "bg-gray-200 dark:bg-slate-800"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_360px]">
        <div className="space-y-6">
          {currentStep >= 1 && (
            <Card className="border border-slate-200/80 bg-white p-6 shadow-xs dark:bg-slate-900 dark:border-slate-800 rounded-2xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-50">Choose your consultant</h3>
              {doctors.length > 1 && (
                <div className="mb-4 grid gap-3 md:grid-cols-2">
                  {doctors.slice(0, 4).map((doctorOption) => (
                    <button
                      key={doctorOption.id}
                      type="button"
                      onClick={() => setSelectedDoctor(doctorOption)}
                      className={`rounded-[1.4rem] border px-4 py-4 text-left transition-all ${
                        selectedDoctor?.id === doctorOption.id
                          ? "border-cyan-500 bg-cyan-50 shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300 dark:border-slate-800 dark:bg-slate-900"
                      }`}
                    >
                      <p className="font-medium text-gray-900 dark:text-slate-100">{doctorOption.name}</p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{doctorOption.specialty}</p>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 rounded-[1.5rem] bg-gradient-to-br from-gray-50 to-gray-100 p-5 dark:from-slate-900 dark:to-slate-950">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-600 to-teal-500 text-lg font-semibold text-white shadow-lg shadow-cyan-500/20">
                  {doctor.avatar || doctor.name.split(" ").slice(0, 2).map((part: string) => part[0]).join("")}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-slate-50">{doctor.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{doctor.specialty}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span>{doctor.experience} experience</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {doctor.rating}
                    </span>
                  </p>
                </div>
              </div>
            </Card>
          )}

          {currentStep >= 2 && (
            <Card className="border border-slate-200/80 p-6 shadow-xs bg-white dark:bg-slate-900 dark:border-slate-800 rounded-2xl">
              <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-50">Choose consultation mode</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setConsultationType("online")}
                  className={`rounded-xl border p-5 text-left transition-all ${
                    consultationType === "online"
                      ? "border-teal-600 bg-teal-50/40 shadow-xs ring-1 ring-teal-500/20 dark:bg-teal-950/30 dark:border-teal-700"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700 border border-teal-200/60 dark:bg-teal-950/40 dark:text-teal-300">
                      <Video className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Video Consultation</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-50">{formatINR(getConsultationFee(doctor, "online"))}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    HD clinical video consultation with instant digital prescriptions and lab test recommendations.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setConsultationType("offline")}
                  className={`rounded-xl border p-5 text-left transition-all ${
                    consultationType === "offline"
                      ? "border-teal-600 bg-teal-50/40 shadow-xs ring-1 ring-teal-500/20 dark:bg-teal-950/30 dark:border-teal-700"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">In-Person Clinic Visit</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-50">{formatINR(getConsultationFee(doctor, "offline"))}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    In-person physical examination at the hospital clinic with automated queue tokens.
                  </p>
                </button>
              </div>
            </Card>
          )}

          {currentStep >= 3 && currentStep < 5 && (
            <Card className="border border-slate-200/80 p-6 shadow-xs bg-white dark:bg-slate-900 dark:border-slate-800 rounded-2xl">
              <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-50">Select date and slot</h3>

              <div className="mb-6 flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-xl border border-slate-200 p-3"
                  disabled={(date) => date < today}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Available Time Slots</p>
                  <span className="text-xs text-slate-400">Selected: <strong className="text-teal-700 dark:text-teal-300">{selectedSlot}</strong></span>
                </div>
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-full px-3.5 py-2 text-xs font-medium transition-all text-center ${
                          isSelected
                            ? "bg-teal-600 text-white font-semibold shadow-xs ring-2 ring-teal-500/20"
                            : "border border-slate-200 bg-white text-slate-700 hover:border-teal-400 hover:bg-teal-50/40 hover:text-teal-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Reason for visit</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="E.g. Routine checkup, follow-up on lab tests, fever or chest pain."
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-2xs outline-none transition-all focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50"
                />
              </div>
            </Card>
          )}

          {currentStep === 4 && (
            <Card className="border border-slate-200/80 bg-white p-6 shadow-xs dark:bg-slate-900 dark:border-slate-800 rounded-2xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-50">Payment Options</h3>

              <div className="grid gap-3 md:grid-cols-2">
                {paymentOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPaymentMethod(option.value)}
                      className={`rounded-[1.5rem] border p-4 text-left transition-all ${
                        paymentMethod === option.value
                          ? "border-cyan-500 bg-cyan-50 shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300 dark:border-slate-800 dark:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${option.accent} text-white`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-slate-50">{option.title}</p>
                          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{option.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/60">
                {paymentMethod === "upi" && (
                  <div className="grid gap-5 lg:grid-cols-[180px_minmax(0,1fr)]">
                    <div className="grid grid-cols-12 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-700">
                      {qrPattern.join("").split("").map((cell, index) => (
                        <span key={index} className={`aspect-square ${cell === "1" ? "bg-slate-950" : "bg-white"}`} />
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Scan with any UPI app</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Use Google Pay, PhonePe, Paytm, or any banking scanner. UPI ID: <span className="font-medium text-slate-900 dark:text-slate-50">pay@medirxcare</span>
                      </p>
                      <input
                        type="text"
                        placeholder="Optional: enter your UPI ID"
                        className="mt-4 h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-400 dark:focus:ring-teal-500/30"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Card Number</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-400 dark:focus:ring-teal-500/30"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-400 dark:focus:ring-teal-500/30"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">CVV</label>
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={4}
                          className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-400 dark:focus:ring-teal-500/30"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "wallet" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {["PhonePe", "Google Pay", "Paytm", "Amazon Pay"].map((wallet) => (
                      <button
                        key={wallet}
                        type="button"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-left text-sm font-medium text-slate-900 transition-all hover:border-teal-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-teal-600"
                      >
                        {wallet}
                      </button>
                    ))}
                  </div>
                )}

                {paymentMethod === "netbanking" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <select className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-teal-400 dark:focus:ring-teal-500/30">
                      <option>Choose your bank</option>
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>State Bank of India</option>
                      <option>Axis Bank</option>
                    </select>
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                      Additional online banking options will be available after selecting your bank.
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {bookingError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {bookingError}
            </div>
          )}

          {currentStep === 5 && (
            <Card className="border-0 p-8 text-center shadow-sm dark:bg-slate-950">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-slate-50">Booking Confirmed</h3>
              <p className="mb-6 text-gray-600 dark:text-slate-400">
                Your appointment has been booked successfully with a lower, affordable consultation fee.
              </p>

              <div className="space-y-3 rounded-[1.6rem] bg-gray-50 p-6 text-left dark:bg-slate-900">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-slate-400">Appointment ID</span>
                  <span className="font-semibold text-gray-900 dark:text-slate-50">#{bookingResult?.id || "APT-PENDING"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-slate-400">Date & Time</span>
                  <span className="font-semibold text-gray-900 dark:text-slate-50">
                    {bookingResult?.date || selectedDate?.toLocaleDateString()} at {bookingResult?.time || selectedSlot}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-slate-400">Mode</span>
                  <span className="font-semibold text-gray-900 dark:text-slate-50">{bookingResult?.mode || (consultationType === "online" ? "Video" : "In-Person")}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-slate-400">Payment Method</span>
                  <span className="font-semibold text-gray-900 dark:text-slate-50">{paymentLabels[(bookingResult?.paymentMethod || paymentMethod) as keyof typeof paymentLabels]}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {consultationType === "online" && bookingResult?.id && (
                  <Button
                    onClick={() => navigate(`/dashboard/consultation/${bookingResult.id}`)}
                    className="rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-500 px-5 text-white hover:from-cyan-700 hover:to-teal-600"
                  >
                    <Video className="h-4 w-4" />
                    Open Consultation Room
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="rounded-2xl border-gray-200 px-5"
                >
                  Back to Dashboard
                </Button>
              </div>
            </Card>
          )}
        </div>

        <Card className="sticky top-6 h-fit border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 rounded-2xl">
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-50">Booking Summary</h3>

          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-4 dark:border-slate-800">
              <p className="text-sm text-gray-600 dark:text-slate-400">Doctor</p>
              <p className="font-medium text-gray-900 dark:text-slate-50">{doctor.name}</p>
            </div>

            {currentStep >= 2 && (
              <div className="border-b border-gray-100 pb-4 dark:border-slate-800">
                <p className="text-sm text-gray-600 dark:text-slate-400">Consultation Type</p>
                <p className="font-medium text-gray-900 dark:text-slate-50">
                  {consultationType === "online" ? "Video Consultation" : "In-Person Visit"}
                </p>
              </div>
            )}

            {currentStep >= 3 && (
              <>
                <div className="border-b border-gray-100 pb-4 dark:border-slate-800">
                  <p className="text-sm text-gray-600 dark:text-slate-400">Date</p>
                  <p className="font-medium text-gray-900 dark:text-slate-50">{selectedDate?.toLocaleDateString()}</p>
                </div>
                <div className="border-b border-gray-100 pb-4 dark:border-slate-800">
                  <p className="text-sm text-gray-600 dark:text-slate-400">Time</p>
                  <p className="font-medium text-gray-900 dark:text-slate-50">{selectedSlot}</p>
                </div>
                <div className="border-b border-gray-100 pb-4 dark:border-slate-800">
                  <p className="text-sm text-gray-600 dark:text-slate-400">Reason</p>
                  <p className="font-medium text-gray-900 dark:text-slate-50">{reason || "General consultation"}</p>
                </div>
              </>
            )}

            {currentStep >= 4 && (
              <div className="border-b border-gray-100 pb-4 dark:border-slate-800">
                <p className="text-sm text-gray-600 dark:text-slate-400">Payment Option</p>
                <p className="font-medium text-gray-900 dark:text-slate-50">{paymentLabels[paymentMethod]}</p>
              </div>
            )}

            <div className="pt-2">
              <div className="mb-2 flex justify-between">
                <span className="text-gray-600 dark:text-slate-400">Consultation Fee</span>
                <span className="font-medium text-gray-900 dark:text-slate-50">{formatINR(consultationFee)}</span>
              </div>
              <div className="mb-2 flex justify-between">
                <span className="text-gray-600 dark:text-slate-400">Platform Fee</span>
                <span className="font-medium text-gray-900 dark:text-slate-50">{formatINR(PLATFORM_FEE)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 dark:border-slate-800">
                <span className="font-semibold text-gray-900 dark:text-slate-50">Total Amount</span>
                <span className="text-xl font-semibold text-cyan-600">{formatINR(totalAmount)}</span>
              </div>
            </div>
          </div>

          {currentStep < 5 && (
            <Button
              onClick={handleContinue}
              disabled={isBooking}
              className="mt-6 h-14 w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-500 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-700 hover:to-teal-600"
            >
              {currentStep === 4 ? (
                <>
                  <CreditCard className="h-4 w-4" />
                  {isBooking ? "Processing payment..." : `Pay ${formatINR(totalAmount)} & Confirm`}
                </>
              ) : (
                "Continue"
              )}
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
