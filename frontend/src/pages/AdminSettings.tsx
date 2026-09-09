import { useState } from "react";
import {
  Bell,
  Database,
  Globe,
  Lock,
  Save,
  Settings2,
  Shield,
  User,
} from "lucide-react";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Input } from "../components/common/Input";
import { Label } from "../components/common/Label";
import { Switch } from "../components/common/Switch";
import { ProfileSettingsShell, type ProfileSettingsSection } from "../components/profile/ProfileSettingsShell";
import { useAuth } from "../context/AuthContext";

const notificationOptions = [
  {
    title: "System Alerts",
    description: "Receive alerts about platform health, uptime, and critical incidents.",
    enabled: true,
  },
  {
    title: "New Registrations",
    description: "Get notified when new doctors or patients join the platform.",
    enabled: true,
  },
  {
    title: "Appointment Reports",
    description: "Receive a daily summary of scheduled and completed appointments.",
    enabled: false,
  },
  {
    title: "Security Notifications",
    description: "Review login anomalies and access-related warnings immediately.",
    enabled: true,
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

export function AdminSettings() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Settings saved successfully!");
    }, 1000);
  };

  const sections: ProfileSettingsSection[] = [
    {
      id: "profile",
      label: "Admin Profile",
      description: "Manage your organization identity and administrative defaults.",
      icon: User,
      content: (
        <Card className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100">
              <User className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Administrative Profile</h3>
              <p className="text-sm text-gray-500">Keep the core organization and administrator details current.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name</Label>
              <Input id="organizationName" defaultValue={user?.adminProfile?.organizationName || "MEDIrxCARE Healthcare"} className="h-11 rounded-xl bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminName">Administrator</Label>
              <Input id="adminName" defaultValue={user?.name || ""} placeholder="Administrator Name" className="h-11 rounded-xl bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input id="adminEmail" defaultValue={user?.email || ""} placeholder="admin@medirxcare.in" className="h-11 rounded-xl bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <select id="language" className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm">
                <option>English (India)</option>
                <option>Hindi</option>
                <option>Tamil</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select id="timezone" className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm">
                <option>UTC-5 (Eastern Time)</option>
                <option>UTC+0 (London)</option>
                <option>UTC+5:30 (Mumbai)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Inbox</Label>
              <Input id="supportEmail" defaultValue="support@medirxcare.in" className="h-11 rounded-xl bg-gray-50" />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} className="rounded-xl bg-cyan-600 px-6 text-white shadow-md">
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </Card>
      ),
    },
    {
      id: "security",
      label: "Security",
      description: "Review authentication, account protection, and security policies.",
      icon: Lock,
      content: (
        <Card className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
              <Lock className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Security Controls</h3>
              <p className="text-sm text-gray-500">Protect sensitive data and administrative access.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="max-w-xl space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" className="h-11 rounded-xl bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" className="h-11 rounded-xl bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" className="h-11 rounded-xl bg-gray-50" />
              </div>
            </div>

            <SettingToggle
              title="Enable Two-Factor Authentication"
              description="Require an additional verification step for administrative sign-ins."
              enabled
            />
            <SettingToggle
              title="Single Sign-On"
              description="Use your organization identity provider for administrator access."
            />
            <SettingToggle
              title="Security Audit Alerts"
              description="Receive immediate alerts when policy or access anomalies are detected."
              enabled
            />

            <div className="flex justify-end">
              <Button onClick={handleSave} className="rounded-xl bg-red-600 px-6 text-white shadow-md">
                Update Security
              </Button>
            </div>
          </div>
        </Card>
      ),
    },
    {
      id: "notifications",
      label: "Notifications",
      description: "Choose which platform-level updates reach the admin team.",
      icon: Bell,
      content: (
        <Card className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
              <p className="text-sm text-gray-500">Stay updated on platform operations without unnecessary noise.</p>
            </div>
          </div>

          <div className="space-y-4">
            {notificationOptions.map((option) => (
              <SettingToggle key={option.title} {...option} />
            ))}
          </div>
        </Card>
      ),
    },
    {
      id: "system",
      label: "System Settings",
      description: "Control capacity, data retention, maintenance, and platform endpoints.",
      icon: Database,
      content: (
        <Card className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
              <Database className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Platform Configuration</h3>
              <p className="text-sm text-gray-500">Set operational defaults that affect the entire platform.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxCapacity">Max Patient Capacity</Label>
              <Input id="maxCapacity" type="number" defaultValue="10000" className="h-11 rounded-xl bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retention">Data Retention (Days)</Label>
              <Input id="retention" type="number" defaultValue="365" className="h-11 rounded-xl bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Primary Region</Label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input id="region" defaultValue="ap-south-1" className="h-11 rounded-xl bg-gray-50 pl-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiEndpoint">Platform API Endpoint</Label>
              <Input
                id="apiEndpoint"
                defaultValue="http://localhost:5001/api"
                className="h-11 rounded-xl bg-gray-50 font-mono text-xs"
              />
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <SettingToggle
              title="Maintenance Mode"
              description="Temporarily pause patient-facing interactions while maintenance is performed."
            />
            <SettingToggle
              title="Strict Compliance Logging"
              description="Store extended audit trails for high-sensitivity administrative actions."
              enabled
            />
            <SettingToggle
              title="Automatic Backup Verification"
              description="Run recurring checks to confirm backup health and restore readiness."
              enabled
            />
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} className="rounded-xl bg-amber-600 px-6 text-white shadow-md">
              <Settings2 className="h-4 w-4" />
              Apply System Changes
            </Button>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <ProfileSettingsShell
      title="Profile & Settings"
      description="Manage administrative profile details, security, notifications, and platform controls from one organized workspace."
      sections={sections}
      defaultSectionId="profile"
    />
  );
}
