import {
  Bell,
  Clock3,
  Lock,
  Mail,
  Phone,
  Settings2,
  Stethoscope,
  User,
} from "lucide-react";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Input } from "../components/common/Input";
import { Label } from "../components/common/Label";
import { Switch } from "../components/common/Switch";
import { Textarea } from "../components/common/Textarea";
import { ProfileSettingsShell, type ProfileSettingsSection } from "../components/profile/ProfileSettingsShell";
import { useAuth } from "../context/AuthContext";

const doctorNotifications = [
  {
    title: "Appointment Reminders",
    description: "Receive alerts before upcoming consultations and schedule changes.",
    enabled: true,
  },
  {
    title: "Urgent Queue Updates",
    description: "Highlight patient status changes and high-priority arrivals.",
    enabled: true,
  },
  {
    title: "Prescription Follow-ups",
    description: "Get reminders to review pending refills and care plans.",
    enabled: false,
  },
];

function SettingToggle({
  title,
  description,
  enabled,
}: {
  title: string;
  description: string;
  enabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="mt-1 text-sm leading-6 text-gray-500">{description}</p>
      </div>
      <Switch defaultChecked={enabled} className="mt-1" />
    </div>
  );
}

export function DoctorSettings() {
  const { user } = useAuth();

  const sections: ProfileSettingsSection[] = [
    {
      id: "profile",
      label: "Professional Profile",
      description: "Update your doctor identity, specialty, and practice details.",
      icon: User,
      content: (
        <Card className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100">
              <User className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
              <p className="text-sm text-gray-500">Keep your credentials and patient-facing details up to date.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" defaultValue={user?.name || ""} placeholder="Full Name" className="h-11 rounded-xl bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Input id="specialty" defaultValue={user?.doctorProfile?.specialization || ""} placeholder="Clinical Specialty" className="h-11 rounded-xl bg-gray-50" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="license">License Number</Label>
                <Input id="license" defaultValue={user?.doctorProfile?.licenseNumber || ""} placeholder="Medical Council License" className="h-11 rounded-xl bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input id="experience" defaultValue={user?.doctorProfile?.experienceYears ? String(user.doctorProfile.experienceYears) : ""} placeholder="Years of Practice" className="h-11 rounded-xl bg-gray-50" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  defaultValue={user?.email || ""}
                  placeholder="doctor@medirxcare.in"
                  className="h-11 rounded-xl bg-gray-50 pl-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input id="phone" defaultValue="+91 98765 41001" className="h-11 rounded-xl bg-gray-50 pl-11" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                rows={4}
                defaultValue="Senior cardiologist focused on preventive care, diagnostics, and long-term cardiac health."
                className="rounded-xl bg-gray-50"
              />
            </div>

            <Button className="rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 text-white shadow-sm">
              Save Profile
            </Button>
          </div>
        </Card>
      ),
    },
    {
      id: "security",
      label: "Security",
      description: "Manage password protection and sign-in safety.",
      icon: Lock,
      content: (
        <Card className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
              <Lock className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Security</h3>
              <p className="text-sm text-gray-500">Protect your account and clinical workspace access.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" className="h-11 rounded-xl bg-gray-50" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" className="h-11 rounded-xl bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" className="h-11 rounded-xl bg-gray-50" />
              </div>
            </div>

            <SettingToggle
              title="Two-Factor Authentication"
              description="Require a second verification step when accessing your dashboard."
              enabled
            />
            <SettingToggle
              title="Session Timeout"
              description="Automatically sign out after periods of inactivity in shared environments."
              enabled
            />

            <Button className="rounded-xl bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-sm">
              Update Security
            </Button>
          </div>
        </Card>
      ),
    },
    {
      id: "notifications",
      label: "Notifications",
      description: "Choose which clinical alerts and reminders you receive.",
      icon: Bell,
      content: (
        <Card className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-500">Stay on top of schedule, queue, and follow-up changes.</p>
            </div>
          </div>

          <div className="space-y-4">
            {doctorNotifications.map((setting) => (
              <SettingToggle key={setting.title} {...setting} />
            ))}
          </div>
        </Card>
      ),
    },
    {
      id: "preferences",
      label: "Practice Settings",
      description: "Customize workflow defaults for appointments and follow-ups.",
      icon: Settings2,
      content: (
        <Card className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
              <Settings2 className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Practice Preferences</h3>
              <p className="text-sm text-gray-500">Set defaults for how you work with patients and your schedule.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="consultationMode">Default Consultation Type</Label>
                <select
                  id="consultationMode"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm"
                >
                  <option>In-person</option>
                  <option>Video consultation</option>
                  <option>Hybrid</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="slotLength">Appointment Slot Length</Label>
                <select id="slotLength" className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm">
                  <option>15 minutes</option>
                  <option>20 minutes</option>
                  <option>30 minutes</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select id="timezone" className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm">
                  <option>IST (UTC+5:30)</option>
                  <option>GST (UTC+4)</option>
                  <option>UTC</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="availability">Availability Block</Label>
                <div className="relative">
                  <Clock3 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input id="availability" defaultValue="Mon-Sat, 09:30 AM - 05:30 PM" className="h-11 rounded-xl bg-gray-50 pl-11" />
                </div>
              </div>
            </div>

            <SettingToggle
              title="Reserve Emergency Slots"
              description="Hold back a small number of same-day slots for urgent cases."
              enabled
            />
            <SettingToggle
              title="Automatic Follow-up Reminders"
              description="Prompt patients when they are due for a follow-up consultation."
              enabled
            />

            <Button className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
              Save Practice Settings
            </Button>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <ProfileSettingsShell
      title="Profile & Settings"
      description="Manage your professional profile, security, notifications, and practice defaults from one polished workspace."
      sections={sections}
      defaultSectionId="profile"
    />
  );
}
