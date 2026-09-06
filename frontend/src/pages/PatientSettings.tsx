import { useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  CreditCard,
  Globe,
  HeartPulse,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Input } from "../components/common/Input";
import { Label } from "../components/common/Label";
import { Switch } from "../components/common/Switch";
import { Textarea } from "../components/common/Textarea";
import { ProfileSettingsShell, type ProfileSettingsSection } from "../components/profile/ProfileSettingsShell";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/ApiService";
import { APP_NAME } from "../utils/brand";

function SettingToggle({
  title,
  description,
  enabled = false,
  onChange,
}: {
  title: string;
  description: string;
  enabled?: boolean;
  onChange?: (val: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <Switch checked={enabled} onCheckedChange={onChange} className="mt-1" />
    </div>
  );
}

export function PatientSettings() {
  const { user, updateUser } = useAuth();

  // Profile Form State
  const [initialSplitFirst = "", initialSplitLast = ""] = (user?.name || "").split(" ");
  const [firstName, setFirstName] = useState(initialSplitFirst || "Rohan");
  const [lastName, setLastName] = useState(initialSplitLast || "Verma");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "+91 98765 42001");
  const [address, setAddress] = useState(user?.address || "Indiranagar, Bengaluru, Karnataka");
  const [age, setAge] = useState<string>("28");
  const [gender, setGender] = useState<string>("Male");
  const [bloodGroup, setBloodGroup] = useState<string>("O+");

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Preferences & Notifications State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [shareData, setShareData] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

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
        // Fallback to current session user info
        console.warn("Could not load backend user profile:", err);
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

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

  const sections: ProfileSettingsSection[] = [
    {
      id: "profile",
      label: "Personal Info",
      description: "Core patient details, contact numbers, and health records info.",
      icon: User,
      content: (
        <Card className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Patient Profile</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Keep your clinical details current for doctor consultations and prescriptions.</p>
              </div>
            </div>
            {isLoadingProfile && (
              <span className="text-xs font-medium text-teal-600 animate-pulse">Syncing...</span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-semibold text-slate-700 dark:text-slate-300">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50/70 text-sm focus:bg-white dark:bg-slate-900"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50/70 text-sm focus:bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address (Registered)</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="h-11 rounded-xl bg-slate-100 text-sm pl-10 text-slate-500 cursor-not-allowed dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-11 rounded-xl bg-slate-50/70 text-sm pl-10 focus:bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Clinical Health Snapshot */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="mb-3 flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Clinical Metrics (Vitals & Records)
                </h4>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="age" className="text-xs font-medium text-slate-600 dark:text-slate-400">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 30"
                    className="h-10 rounded-xl bg-white text-sm dark:bg-slate-950"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="gender" className="text-xs font-medium text-slate-600 dark:text-slate-400">Biological Gender</Label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bloodGroup" className="text-xs font-medium text-slate-600 dark:text-slate-400">Blood Group</Label>
                  <select
                    id="bloodGroup"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
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

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Home Address (Sample Pickup & Emergency Location)</Label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <Textarea
                  id="address"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Landmark, City, State, PIN"
                  className="rounded-xl bg-slate-50/70 text-sm pl-10 pt-2.5 focus:bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                type="submit"
                disabled={isSavingProfile}
                className="rounded-xl bg-teal-600 px-6 font-semibold text-white shadow-sm hover:bg-teal-700"
              >
                {isSavingProfile ? "Saving to Database..." : "Save Profile Changes"}
              </Button>
            </div>
          </form>
        </Card>
      ),
    },
    {
      id: "security",
      label: "Security & Login",
      description: "Password reset, two-factor authentication, and active session safety.",
      icon: Lock,
      content: (
        <Card className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Password & Security</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Secure your account with regular password updates and multi-factor defense.</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="h-11 rounded-xl bg-slate-50/70 text-sm focus:bg-white dark:bg-slate-900"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-xs font-semibold text-slate-700 dark:text-slate-300">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="h-11 rounded-xl bg-slate-50/70 text-sm focus:bg-white dark:bg-slate-900"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="h-11 rounded-xl bg-slate-50/70 text-sm focus:bg-white dark:bg-slate-900"
                  required
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <SettingToggle
                title="Two-Factor Authentication (2FA)"
                description="Require a one-time OTP code on your registered mobile number when signing in from unfamiliar browsers."
                enabled={twoFactorAuth}
                onChange={(v) => {
                  setTwoFactorAuth(v);
                  toast.success(`Two-factor authentication ${v ? "enabled" : "disabled"}.`);
                }}
              />
              <SettingToggle
                title="Instant Sign-in Alerts"
                description="Receive an email whenever your patient portal is accessed from a new IP address or device."
                enabled={true}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                type="submit"
                disabled={isUpdatingPassword}
                className="rounded-xl bg-indigo-600 px-6 font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                {isUpdatingPassword ? "Updating Password..." : "Update Password"}
              </Button>
            </div>
          </form>
        </Card>
      ),
    },
    {
      id: "billing",
      label: "Billing & Cards",
      description: "Manage UPI handles, clinical consultation copays, and receipts.",
      icon: CreditCard,
      content: (
        <Card className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Saved Payment Methods</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Used for lab bookings, doctor appointments, and medical checkup reservations.</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Secure payment gateway linked.")}
              className="rounded-xl text-xs font-semibold"
            >
              Add Card / UPI
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-teal-200/80 bg-teal-50/40 p-4 dark:border-teal-900/60 dark:bg-teal-950/30">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-900">
                  <CreditCard className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">HDFC Regalia Card •••• 4242</p>
                    <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-800 dark:bg-teal-900/80 dark:text-teal-300">Default</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Expires 12/28 • Verified Visa</p>
                </div>
              </div>
              <div className="flex items-center text-xs font-medium text-emerald-600 gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Active
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-900">
                  <Globe className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">UPI ID: rohan@okhdfcbank</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Instant UPI AutoPay enabled</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toast.success("Set as primary payment method.")}
                className="text-xs text-slate-600 hover:text-slate-900"
              >
                Make Primary
              </Button>
            </div>
          </div>
        </Card>
      ),
    },
    {
      id: "notifications",
      label: "Notifications",
      description: `Appointment reminders, queue updates, and care summaries.`,
      icon: Bell,
      content: (
        <Card className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Notification Alerts</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure how {APP_NAME} contacts you about consultations and test results.</p>
            </div>
          </div>

          <div className="space-y-3">
            <SettingToggle
              title="Email Notifications"
              description="Receive booking receipts, diagnostic reports (PDF), and follow-up medical advice."
              enabled={emailNotifications}
              onChange={(val) => {
                setEmailNotifications(val);
                toast.success(`Email notifications ${val ? "enabled" : "disabled"}.`);
              }}
            />
            <SettingToggle
              title="SMS Queue Alerts"
              description="Receive real-time text messages when your OPD token is 2 spots away from the doctor's desk."
              enabled={smsAlerts}
              onChange={(val) => {
                setSmsAlerts(val);
                toast.success(`SMS queue alerts ${val ? "enabled" : "disabled"}.`);
              }}
            />
            <SettingToggle
              title="Browser Push Notifications"
              description="Allow desktop notification popups for real-time consultation alerts and doctor availability."
              enabled={pushNotifications}
              onChange={(val) => {
                setPushNotifications(val);
                toast.success(`Push notifications ${val ? "enabled" : "disabled"}.`);
              }}
            />
          </div>
        </Card>
      ),
    },
    {
      id: "privacy",
      label: "Privacy & Data",
      description: "Health data sharing, HIPAA compliance, and doctor access controls.",
      icon: Shield,
      content: (
        <Card className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Privacy & Consent Controls</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Protect your medical history and govern which physicians can inspect your records.</p>
            </div>
          </div>

          <div className="space-y-3">
            <SettingToggle
              title="Share Medical History With Attending Doctors"
              description="Allow registered doctors on your appointment roster to view prior prescriptions and lab reports."
              enabled={shareData}
              onChange={(val) => {
                setShareData(val);
                toast.success(`Doctor data sharing ${val ? "allowed" : "restricted"}.`);
              }}
            />
            <SettingToggle
              title="Profile Visibility in Clinic OPD Directory"
              description="Permit reception desk and nursing staff to search your patient profile for expedited check-in."
              enabled={profileVisibility}
              onChange={(val) => {
                setProfileVisibility(val);
                toast.success(`Directory visibility ${val ? "enabled" : "hidden"}.`);
              }}
            />
            <SettingToggle
              title="Anonymized Clinical Quality Research"
              description="Allow anonymized vitals to contribute to medical research and healthcare queue optimization."
              enabled={false}
              onChange={(val) => {
                toast.success(`Research consent ${val ? "granted" : "revoked"}.`);
              }}
            />
          </div>
        </Card>
      ),
    },
  ];

  return (
    <ProfileSettingsShell
      sections={sections}
      defaultSectionId="profile"
    />
  );
}
