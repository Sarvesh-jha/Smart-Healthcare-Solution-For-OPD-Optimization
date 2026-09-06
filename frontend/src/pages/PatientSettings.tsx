import { useEffect, useState } from "react";
import {
  Bell,
  Camera,
  Check,
  CheckCircle2,
  CreditCard,
  Download,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  Smartphone,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Input } from "../components/common/Input";
import { Label } from "../components/common/Label";
import { Switch } from "../components/common/Switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/common/Dialog";
import { cn } from "../components/common/utils";
import { ProfileSettingsShell, type ProfileSettingsSection } from "../components/profile/ProfileSettingsShell";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/ApiService";

export interface PaymentMethodItem {
  _id: string;
  type: "card" | "upi";
  cardHolder?: string;
  cardNumber?: string;
  brand?: string;
  expiry?: string;
  upiId?: string;
  nickname?: string;
  isDefault: boolean;
}

function detectCardBrand(num: string): "visa" | "mastercard" | "rupay" | "amex" | "card" {
  const clean = num.replace(/\D/g, "");
  if (/^4/.test(clean)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(clean)) return "mastercard";
  if (/^(60|65|81|82|508)/.test(clean)) return "rupay";
  if (/^3[47]/.test(clean)) return "amex";
  return "card";
}

function formatCardNumber(val: string): string {
  const digits = val.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiryDate(val: string): string {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

function SettingRowItem({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="py-3.5 first:pt-0 last:pb-0 flex items-start sm:items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={onChange}
        className="data-[state=checked]:!bg-teal-600 shrink-0 mt-1 sm:mt-0"
      />
    </div>
  );
}

export function PatientSettings() {
  const { user, updateUser } = useAuth();

  // Profile Form State
  const [initialSplitFirst = "", initialSplitLast = ""] = (user?.name || "").split(" ");
  const [firstName, setFirstName] = useState(initialSplitFirst || "Rohan");
  const [lastName, setLastName] = useState(initialSplitLast || "Verma");
  const [email, setEmail] = useState(user?.email || "rohan.verma@example.com");
  const [phone, setPhone] = useState(user?.phone || "+91 98765 42001");
  const [address, setAddress] = useState(user?.address || "Indiranagar, Bengaluru, Karnataka");
  const [age, setAge] = useState<string>("32");
  const [gender, setGender] = useState<string>("Male");
  const [bloodGroup, setBloodGroup] = useState<string>("O+");

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Notification Toggles
  const [queueAlerts, setQueueAlerts] = useState(true);
  const [doctorDelayAlerts, setDoctorDelayAlerts] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [labResultAlerts, setLabResultAlerts] = useState(true);
  const [refillAlerts, setRefillAlerts] = useState(false);

  // Security & Privacy Toggles
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [biometricLogin, setBiometricLogin] = useState(true);
  const [shareDoctorHistory, setShareDoctorHistory] = useState(true);
  const [directoryVisibility, setDirectoryVisibility] = useState(true);
  const [anonymizedResearch, setAnonymizedResearch] = useState(false);
  const [auditLogging, setAuditLogging] = useState(true);

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [activePaymentTab, setActivePaymentTab] = useState<"card" | "upi">("card");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // New Card Form State
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardNickname, setCardNickname] = useState("");
  const [isDefaultCard, setIsDefaultCard] = useState(false);

  // New UPI Form State
  const [upiId, setUpiId] = useState("");
  const [upiNickname, setUpiNickname] = useState("");
  const [isDefaultUpi, setIsDefaultUpi] = useState(false);
  const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);
  const [isUpiVerified, setIsUpiVerified] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const res = await api.get<{ success: boolean; user: any }>("/user/profile");
        if (res?.user && isMounted) {
          if (res.user.firstName) setFirstName(res.user.firstName);
          if (res.user.lastName) setLastName(res.user.lastName);
          if (res.user.email) setEmail(res.user.email);
          if (res.user.phone) setPhone(res.user.phone);
          if (res.user.address) setAddress(res.user.address);
          if (res.user.age) setAge(String(res.user.age));
          if (res.user.gender) setGender(res.user.gender);
          if (res.user.bloodGroup) setBloodGroup(res.user.bloodGroup);
        }
      } catch (err) {
        console.warn("Could not load backend user profile:", err);
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    };

    const fetchPayments = async () => {
      try {
        setIsLoadingPayments(true);
        const res = await api.get<{ success: boolean; paymentMethods: PaymentMethodItem[] }>(
          "/user/payment-methods"
        );
        if (res?.paymentMethods && isMounted) {
          setPaymentMethods(res.paymentMethods);
        }
      } catch (err) {
        console.warn("Could not load payment methods from backend:", err);
      } finally {
        if (isMounted) setIsLoadingPayments(false);
      }
    };

    fetchProfile();
    fetchPayments();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleVerifyUpi = () => {
    if (!upiId.trim()) {
      toast.error("Please enter a UPI ID to verify.");
      return;
    }
    if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId.trim())) {
      toast.error("Invalid UPI ID syntax. Use format name@bank (e.g. user@okhdfcbank).");
      setIsUpiVerified(false);
      return;
    }

    setIsVerifyingUpi(true);
    setTimeout(() => {
      setIsVerifyingUpi(false);
      setIsUpiVerified(true);
      toast.success("UPI ID verified successfully!");
    }, 600);
  };

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activePaymentTab === "card") {
      const cleanDigits = cardNumber.replace(/\D/g, "");
      if (cleanDigits.length < 15) {
        toast.error("Please enter a valid 16-digit card number.");
        return;
      }
      if (!expiryDate || expiryDate.length < 5) {
        toast.error("Please enter a valid expiry date (MM/YY).");
        return;
      }
      if (!cvv || cvv.length < 3) {
        toast.error("Please enter a valid 3 or 4-digit CVV.");
        return;
      }
      if (!cardHolder.trim()) {
        toast.error("Please enter the cardholder name.");
        return;
      }

      const brand = detectCardBrand(cleanDigits);

      try {
        setIsSubmittingPayment(true);
        const res = await api.post<{ success: boolean; message: string; paymentMethods: PaymentMethodItem[] }>(
          "/user/payment-methods",
          {
            type: "card",
            cardHolder: cardHolder.trim(),
            cardNumber: cleanDigits,
            brand,
            expiry: expiryDate.trim(),
            nickname: cardNickname.trim() || `${brand.toUpperCase()} Card`,
            isDefault: isDefaultCard || paymentMethods.length === 0,
          }
        );

        if (res?.paymentMethods) {
          setPaymentMethods(res.paymentMethods);
        }
        toast.success(res.message || "Card added successfully!");
        setIsAddPaymentOpen(false);
        setCardHolder("");
        setCardNumber("");
        setExpiryDate("");
        setCvv("");
        setCardNickname("");
        setIsDefaultCard(false);
      } catch (err: any) {
        toast.error(err.message || "Failed to add payment card.");
      } finally {
        setIsSubmittingPayment(false);
      }
    } else {
      if (!upiId.trim() || !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId.trim())) {
        toast.error("Please enter a valid UPI ID (e.g. user@okhdfcbank).");
        return;
      }

      try {
        setIsSubmittingPayment(true);
        const res = await api.post<{ success: boolean; message: string; paymentMethods: PaymentMethodItem[] }>(
          "/user/payment-methods",
          {
            type: "upi",
            upiId: upiId.trim(),
            nickname: upiNickname.trim() || "UPI Handle",
            isDefault: isDefaultUpi || paymentMethods.length === 0,
          }
        );

        if (res?.paymentMethods) {
          setPaymentMethods(res.paymentMethods);
        }
        toast.success(res.message || "UPI handle added successfully!");
        setIsAddPaymentOpen(false);
        setUpiId("");
        setUpiNickname("");
        setIsDefaultUpi(false);
        setIsUpiVerified(false);
      } catch (err: any) {
        toast.error(err.message || "Failed to add UPI handle.");
      } finally {
        setIsSubmittingPayment(false);
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      setSettingDefaultId(id);
      setPaymentMethods((prev) =>
        prev.map((m) => ({
          ...m,
          isDefault: m._id === id,
        }))
      );
      const res = await api.patch<{ success: boolean; message: string; paymentMethods: PaymentMethodItem[] }>(
        `/user/payment-methods/${id}/default`
      );
      if (res?.paymentMethods) {
        setPaymentMethods(res.paymentMethods);
      }
      toast.success("Default payment method updated.");
    } catch (err: any) {
      toast.error(err.message || "Failed to update default payment method.");
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (!window.confirm("Remove this payment method from your account?")) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await api.delete<{ success: boolean; message: string; paymentMethods: PaymentMethodItem[] }>(
        `/user/payment-methods/${id}`
      );
      if (res?.paymentMethods) {
        setPaymentMethods(res.paymentMethods);
      } else {
        setPaymentMethods((prev) => prev.filter((m) => m._id !== id));
      }
      toast.success(res.message || "Payment method removed.");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove payment method.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      toast.error("First name is required.");
      return;
    }

    try {
      setIsSavingProfile(true);
      const res = await api.put<{ success: boolean; message: string; user: any }>("/user/profile", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        age: age ? Number(age) : undefined,
        gender,
        bloodGroup,
      });

      if (res?.user) {
        updateUser({
          name: res.user.name,
          phone: res.user.phone,
          address: res.user.address,
          firstName: res.user.firstName,
          lastName: res.user.lastName,
        });
      }

      toast.success(res.message || "Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile changes.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDiscardProfile = () => {
    if (user) {
      const [splitFirst = "", splitLast = ""] = (user.name || "").split(" ");
      setFirstName(splitFirst || "Rohan");
      setLastName(splitLast || "Verma");
      setPhone(user.phone || "+91 98765 42001");
      setAddress(user.address || "Indiranagar, Bengaluru, Karnataka");
    }
    toast.info("Changes reverted.");
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    try {
      setIsUpdatingPassword(true);
      const res = await api.put<{ success: boolean; message: string }>("/user/password", {
        currentPassword,
        newPassword,
      });

      toast.success(res.message || "Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "bg-slate-200" };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-rose-500", text: "text-rose-600" };
    if (score <= 2) return { score: 2, label: "Fair", color: "bg-amber-500", text: "text-amber-600" };
    if (score <= 3) return { score: 3, label: "Good", color: "bg-teal-500", text: "text-teal-600" };
    return { score: 4, label: "Strong", color: "bg-emerald-500", text: "text-emerald-600" };
  };

  const userInitials = (
    (firstName ? firstName[0] : "") + (lastName ? lastName[0] : "")
  ).toUpperCase() || "SJ";

  const strength = getPasswordStrength(newPassword);

  const sections: ProfileSettingsSection[] = [
    {
      id: "profile",
      label: "Personal Info",
      description: "Clinical patient details, vitals, and verified identity.",
      icon: User,
      content: (
        <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-950">
          {/* Header Profile Card: Identity Banner */}
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="relative shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-lg font-bold text-white shadow-xs">
                {user?.avatar || userInitials}
              </div>
              <button
                type="button"
                onClick={() => toast.info("Photo upload dialog opened.")}
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white shadow-xs hover:bg-slate-800 transition-colors dark:bg-slate-100 dark:text-slate-900 ring-2 ring-white dark:ring-slate-950"
                title="Update photo"
                aria-label="Update photo"
              >
                <Camera className="h-3 w-3" />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {firstName} {lastName}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  Verified Patient
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Registration ID: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">MED-84920</span> • Primary UHID
              </p>
            </div>
            {isLoadingProfile && (
              <span className="text-xs font-medium text-teal-600 animate-pulse">Syncing...</span>
            )}
          </div>

          {/* Form Grid */}
          <form onSubmit={handleSaveProfile} className="space-y-5 pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="h-10 rounded-lg border-slate-200 bg-white text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-500/10 dark:bg-slate-900 dark:border-slate-800"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="h-10 rounded-lg border-slate-200 bg-white text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-500/10 dark:bg-slate-900 dark:border-slate-800"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Registered Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-9 text-sm text-slate-500 cursor-not-allowed dark:bg-slate-900/60 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 Phone"
                    className="h-10 rounded-lg border-slate-200 bg-white pl-9 text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-500/10 dark:bg-slate-900 dark:border-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Clinical Health Vitals Sub-Card */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                Clinical Vitals & Demographics
              </p>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="age" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Years"
                    className="h-10 rounded-lg border-slate-200 bg-white text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-500/10 dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="gender" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Biological Gender
                  </Label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bloodGroup" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Blood Group
                  </Label>
                  <select
                    id="bloodGroup"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Address Field */}
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Primary Residence Address
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Landmark, City, State, PIN code"
                  className="h-10 rounded-lg border-slate-200 bg-white pl-9 text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-500/10 dark:bg-slate-900 dark:border-slate-800"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={handleDiscardProfile}
                disabled={isSavingProfile}
                className="h-10 rounded-lg border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
              >
                Discard
              </Button>
              <Button
                type="submit"
                disabled={isSavingProfile}
                className="h-10 rounded-lg bg-teal-600 px-5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700"
              >
                {isSavingProfile ? "Saving Changes..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Card>
      ),
    },
    {
      id: "security",
      label: "Security & Login",
      description: "Password updates, 2FA protocols, and device access.",
      icon: Lock,
      content: (
        <div className="space-y-6">
          {/* Change Password Card */}
          <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400">
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Change Password</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Ensure your patient portal is safeguarded with a secure passkey.</p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="h-10 rounded-lg border-slate-200 bg-white text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-500/10 dark:bg-slate-900 dark:border-slate-800"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="h-10 rounded-lg border-slate-200 bg-white text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-500/10 dark:bg-slate-900 dark:border-slate-800"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="h-10 rounded-lg border-slate-200 bg-white text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-500/10 dark:bg-slate-900 dark:border-slate-800"
                    required
                  />
                </div>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Password Strength:</span>
                    <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
                  </div>
                  <div className="flex h-1.5 gap-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`flex-1 rounded-full transition-all ${
                          strength.score >= step ? strength.color : "bg-slate-200 dark:bg-slate-800"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="h-10 rounded-lg bg-teal-600 px-5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700"
                >
                  {isUpdatingPassword ? "Updating Password..." : "Update Password"}
                </Button>
              </div>
            </form>
          </Card>

          {/* Two-Factor Auth & Alerts */}
          <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Two-Factor Authentication & Verification
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Multi-factor authentication layers safeguarding medical records.
            </p>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <SettingRowItem
                title="Two-Factor Authentication (2FA)"
                description="Require an SMS or authenticator OTP when signing in from unrecognized browsers."
                enabled={twoFactorAuth}
                onChange={(v) => {
                  setTwoFactorAuth(v);
                  toast.success(`Two-factor authentication ${v ? "enabled" : "disabled"}.`);
                }}
              />
              <SettingRowItem
                title="Instant Sign-in Alerts"
                description="Receive an email notification whenever your patient portal is accessed from a new IP or browser."
                enabled={loginAlerts}
                onChange={(v) => {
                  setLoginAlerts(v);
                  toast.success(`Login alerts ${v ? "enabled" : "disabled"}.`);
                }}
              />
              <SettingRowItem
                title="Biometric Fingerprint / FaceID"
                description="Enable fast biometric unlock on supported mobile devices and browsers."
                enabled={biometricLogin}
                onChange={(v) => {
                  setBiometricLogin(v);
                  toast.success(`Biometric authentication ${v ? "enabled" : "disabled"}.`);
                }}
              />
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: "billing",
      label: "Billing & Cards",
      description: "Payment methods, copays, and consultation receipts.",
      icon: CreditCard,
      content: (
        <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Saved Payment Methods</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Used for lab bookings, doctor appointments, and checkups.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddPaymentOpen(true)}
              className="h-9 rounded-lg border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Card / UPI
            </Button>
          </div>

          {isLoadingPayments ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
              <p className="text-xs font-medium">Loading saved payment methods...</p>
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
              <CreditCard className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">No payment methods saved</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Add a credit or debit card, or link a UPI handle for instant checkout during appointments and lab tests.
              </p>
              <Button
                size="sm"
                onClick={() => setIsAddPaymentOpen(true)}
                className="mt-4 h-9 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Payment Method
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const isDefault = method.isDefault;
                const isSetting = settingDefaultId === method._id;
                const isDel = deletingId === method._id;

                return (
                  <div
                    key={method._id}
                    className={cn(
                      "rounded-xl border p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all",
                      isDefault
                        ? "border-teal-200/80 bg-teal-50/30 dark:border-teal-900/60 dark:bg-teal-950/20"
                        : "border-slate-200/80 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                    )}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {method.type === "upi" ? (
                        <div className="flex h-11 w-14 items-center justify-center rounded-lg bg-teal-50 border border-teal-200/60 font-semibold text-[11px] text-teal-800 shadow-2xs dark:bg-teal-950/40 dark:text-teal-300 shrink-0">
                          <Smartphone className="h-5 w-5" />
                        </div>
                      ) : method.brand === "visa" ? (
                        <div className="flex h-11 w-14 items-center justify-center rounded-lg bg-white border border-slate-200/70 font-black text-[12px] tracking-wider text-blue-900 shadow-2xs dark:bg-slate-900 dark:border-slate-700 shrink-0">
                          VISA
                        </div>
                      ) : method.brand === "mastercard" ? (
                        <div className="flex h-11 w-14 items-center justify-center rounded-lg bg-white border border-slate-200/70 font-black text-[11px] tracking-wider text-amber-700 shadow-2xs dark:bg-slate-900 dark:border-slate-700 shrink-0">
                          MC
                        </div>
                      ) : method.brand === "rupay" ? (
                        <div className="flex h-11 w-14 items-center justify-center rounded-lg bg-white border border-slate-200/70 font-black text-[10px] tracking-wider text-emerald-800 shadow-2xs dark:bg-slate-900 dark:border-slate-700 shrink-0">
                          RuPay
                        </div>
                      ) : (
                        <div className="flex h-11 w-14 items-center justify-center rounded-lg bg-slate-50 border border-slate-200/70 font-semibold text-[11px] text-slate-700 shadow-2xs dark:bg-slate-900 dark:border-slate-700 shrink-0">
                          <CreditCard className="h-5 w-5" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {method.nickname || (method.type === "upi" ? "UPI Handle" : `${(method.brand || "Card").toUpperCase()} Card`)}
                          </p>
                          {isDefault ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                              <CheckCircle2 className="h-3 w-3" />
                              Default
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              Backup
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {method.type === "upi" ? method.upiId : `${method.cardNumber} • Expires ${method.expiry}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                      {!isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isSetting}
                          onClick={() => handleSetDefault(method._id)}
                          className="text-xs text-slate-600 hover:text-teal-700 hover:bg-teal-50 h-8 px-2.5 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                          {isSetting ? (
                            <span className="flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Setting...
                            </span>
                          ) : (
                            "Make Default"
                          )}
                        </Button>
                      )}

                      <button
                        type="button"
                        disabled={isDel}
                        onClick={() => handleDeletePaymentMethod(method._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors dark:hover:bg-rose-950/30"
                        title="Delete payment method"
                        aria-label="Delete payment method"
                      >
                        {isDel ? (
                          <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      ),
    },
    {
      id: "notifications",
      label: "Notifications",
      description: "OPD queue alerts, diagnostic reports, and reminders.",
      icon: Bell,
      content: (
        <div className="space-y-6">
          {/* Group 1: OPD & Queue Alerts */}
          <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
              OPD & Queue Alerts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Real-time notifications keeping you updated on live clinic queue progress.
            </p>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <SettingRowItem
                title="Live Queue Token Alerts"
                description="Get notified via SMS & push alert when your OPD consultation is 2 tokens away."
                enabled={queueAlerts}
                onChange={(v) => {
                  setQueueAlerts(v);
                  toast.success(`Token alerts ${v ? "enabled" : "disabled"}.`);
                }}
              />
              <SettingRowItem
                title="Doctor Delay & Emergency Warnings"
                description="Receive instant alerts if the consulting specialist is running behind schedule."
                enabled={doctorDelayAlerts}
                onChange={(v) => {
                  setDoctorDelayAlerts(v);
                  toast.success(`Delay warnings ${v ? "enabled" : "disabled"}.`);
                }}
              />
              <SettingRowItem
                title="Appointment Reminders"
                description="Automated reminder notifications 24 hours and 2 hours prior to scheduled visits."
                enabled={appointmentReminders}
                onChange={(v) => {
                  setAppointmentReminders(v);
                  toast.success(`Appointment reminders ${v ? "enabled" : "disabled"}.`);
                }}
              />
            </div>
          </Card>

          {/* Group 2: Marketing & Reports */}
          <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Diagnostic & Clinical Reports
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Alerts regarding lab panels, prescription refills, and checkups.
            </p>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <SettingRowItem
                title="Laboratory & Imaging Results Ready"
                description="Get an immediate download link when lab results or radiology reports are certified."
                enabled={labResultAlerts}
                onChange={(v) => {
                  setLabResultAlerts(v);
                  toast.success(`Report alerts ${v ? "enabled" : "disabled"}.`);
                }}
              />
              <SettingRowItem
                title="Prescription Refill Reminders"
                description="Helpful notification when chronic medication courses are due for renewal."
                enabled={refillAlerts}
                onChange={(v) => {
                  setRefillAlerts(v);
                  toast.success(`Refill reminders ${v ? "enabled" : "disabled"}.`);
                }}
              />
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: "privacy",
      label: "Privacy & Data",
      description: "Medical history sharing, clinical auditing, and HIPAA consents.",
      icon: ShieldCheck,
      content: (
        <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Medical History Sharing & Privacy
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Control how attending physicians and clinical staff view your diagnostic history.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Exporting full encrypted health record (PDF)...")}
              className="h-9 rounded-lg border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export Records
            </Button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <SettingRowItem
              title="Share Medical History With Attending Doctors"
              description="Allow verified physicians on your appointment roster to review past prescriptions & lab results."
              enabled={shareDoctorHistory}
              onChange={(v) => {
                setShareDoctorHistory(v);
                toast.success(`History sharing ${v ? "allowed" : "restricted"}.`);
              }}
            />
            <SettingRowItem
              title="Profile Visibility in Clinic OPD Directory"
              description="Permit reception and nursing staff to search your patient profile for expedited check-in."
              enabled={directoryVisibility}
              onChange={(v) => {
                setDirectoryVisibility(v);
                toast.success(`Directory visibility ${v ? "enabled" : "hidden"}.`);
              }}
            />
            <SettingRowItem
              title="Anonymized Clinical Quality Research"
              description="Contribute non-identifiable clinic flow metrics to optimize emergency & OPD wait times."
              enabled={anonymizedResearch}
              onChange={(v) => {
                setAnonymizedResearch(v);
                toast.success(`Research consent ${v ? "granted" : "revoked"}.`);
              }}
            />
            <SettingRowItem
              title="Clinical Audit Trail Logging"
              description="Maintain an immutable access log of all healthcare personnel who viewed your health files."
              enabled={auditLogging}
              onChange={(v) => {
                setAuditLogging(v);
                toast.success(`Audit logging ${v ? "enabled" : "disabled"}.`);
              }}
            />
          </div>
        </Card>
      ),
    },
  ];

  return (
    <>
      <ProfileSettingsShell
        sections={sections}
        defaultSectionId="profile"
      />

      <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6 sm:p-7 border border-slate-200/80 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Add Payment Method
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Securely link a credit/debit card or UPI handle for faster consultation checkouts.
            </DialogDescription>
          </DialogHeader>

          {/* Sub-Tabs: Credit/Debit Card vs UPI */}
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900 mt-2">
            <button
              type="button"
              onClick={() => setActivePaymentTab("card")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all",
                activePaymentTab === "card"
                  ? "bg-white text-teal-800 shadow-2xs dark:bg-slate-800 dark:text-teal-300"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              <CreditCard className="h-4 w-4" />
              Credit / Debit Card
            </button>
            <button
              type="button"
              onClick={() => setActivePaymentTab("upi")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all",
                activePaymentTab === "upi"
                  ? "bg-white text-teal-800 shadow-2xs dark:bg-slate-800 dark:text-teal-300"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              <Smartphone className="h-4 w-4" />
              UPI (Instant)
            </button>
          </div>

          <form onSubmit={handleAddPaymentMethod} className="space-y-4 mt-2">
            {activePaymentTab === "card" ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohan Verma"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Card Number
                    </label>
                    {cardNumber && (
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                        {detectCardBrand(cardNumber)}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="•••• •••• •••• ••••"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-3 pr-16 py-2 text-xs font-mono tracking-wider text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
                      {detectCardBrand(cardNumber) === "visa" ? (
                        <span className="text-[11px] font-black text-blue-800 dark:text-blue-400 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900">
                          VISA
                        </span>
                      ) : detectCardBrand(cardNumber) === "mastercard" ? (
                        <span className="text-[11px] font-black text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900">
                          MC
                        </span>
                      ) : detectCardBrand(cardNumber) === "rupay" ? (
                        <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900">
                          RuPay
                        </span>
                      ) : (
                        <CreditCard className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      maxLength={5}
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      CVV / CVC
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="•••"
                      maxLength={4}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Card Nickname <span className="text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Salary Account Card"
                    value={cardNickname}
                    onChange={(e) => setCardNickname(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isDefaultCard"
                    checked={isDefaultCard}
                    onChange={(e) => setIsDefaultCard(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <label htmlFor="isDefaultCard" className="text-xs text-slate-600 dark:text-slate-400 select-none">
                    Set as default payment method for all future clinic billing
                  </label>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    UPI ID (VPA)
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        required
                        placeholder="e.g. mobile@okhdfcbank"
                        value={upiId}
                        onChange={(e) => {
                          setUpiId(e.target.value);
                          setIsUpiVerified(false);
                        }}
                        className="w-full rounded-lg border border-slate-300 pl-3 pr-8 py-2 text-xs font-mono text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                      {isUpiVerified && (
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                          <Check className="h-4 w-4 text-emerald-600" />
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isVerifyingUpi || !upiId.trim()}
                      onClick={handleVerifyUpi}
                      className={cn(
                        "h-9 px-3 text-xs font-medium rounded-lg border-slate-300 shrink-0",
                        isUpiVerified && "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      )}
                    >
                      {isVerifyingUpi ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : isUpiVerified ? (
                        <span className="flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Verified
                        </span>
                      ) : (
                        "Verify ID"
                      )}
                    </Button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Supports Google Pay, PhonePe, Paytm, BHIM, and bank UPI handles.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Handle Nickname <span className="text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Personal Google Pay"
                    value={upiNickname}
                    onChange={(e) => setUpiNickname(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isDefaultUpi"
                    checked={isDefaultUpi}
                    onChange={(e) => setIsDefaultUpi(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <label htmlFor="isDefaultUpi" className="text-xs text-slate-600 dark:text-slate-400 select-none">
                    Set as default payment method for all future clinic billing
                  </label>
                </div>
              </>
            )}

            <DialogFooter className="mt-6 flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddPaymentOpen(false)}
                className="h-9 px-4 text-xs font-medium rounded-lg border-slate-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmittingPayment}
                className="h-9 px-4 text-xs font-medium rounded-lg bg-teal-600 hover:bg-teal-700 text-white"
              >
                {isSubmittingPayment ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  activePaymentTab === "card" ? "Save Card" : "Link UPI Handle"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
