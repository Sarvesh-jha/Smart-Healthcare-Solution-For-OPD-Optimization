import { useState } from "react";
import { 
  Users, 
  Calendar, 
  Activity, 
  ShieldCheck, 
  BarChart3, 
  CreditCard, 
  Settings, 
  TrendingUp, 
  UserPlus, 
  CheckCircle, 
  Mail, 
  Briefcase, 
  Plus, 
  ArrowUpRight, 
  Clock, 
  Sparkles,
  FileSpreadsheet,
  AlertTriangle
} from "lucide-react";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Label } from "../components/common/Label";
import { Badge } from "../components/common/Badge";
import { useNavigate } from "react-router";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { StatCard } from "../components/dashboard/StatCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/common/Dialog";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const analyticsDataSets = {
  "Last 7 Days": [
    { label: "Mon", visits: 142, waitTime: 22 },
    { label: "Tue", visits: 168, waitTime: 19 },
    { label: "Wed", visits: 154, waitTime: 24 },
    { label: "Thu", visits: 192, waitTime: 18 },
    { label: "Fri", visits: 210, waitTime: 16 },
    { label: "Sat", visits: 135, waitTime: 14 },
    { label: "Sun", visits: 88, waitTime: 12 },
  ],
  "Last 30 Days": [
    { label: "Week 1", visits: 890, waitTime: 21 },
    { label: "Week 2", visits: 1040, waitTime: 18 },
    { label: "Week 3", visits: 1120, waitTime: 17 },
    { label: "Week 4", visits: 1280, waitTime: 15 },
  ],
  "Today (Hourly)": [
    { label: "08:00", visits: 24, waitTime: 10 },
    { label: "10:00", visits: 68, waitTime: 22 },
    { label: "12:00", visits: 84, waitTime: 25 },
    { label: "14:00", visits: 48, waitTime: 16 },
    { label: "16:00", visits: 72, waitTime: 20 },
    { label: "18:00", visits: 38, waitTime: 14 },
  ],
};

const recentSystemLogs = [
  {
    id: 1,
    title: "New doctor credential verification pending",
    details: "Dr. Priya Sharma submitted clinical registration",
    time: "8 mins ago",
    type: "doctor",
    badge: "Pending Review",
    badgeVariant: "warning" as const,
  },
  {
    id: 2,
    title: "OPD Department capacity rebalanced",
    details: "Cardiology Counter #3 assigned 12 overflow tokens",
    time: "24 mins ago",
    type: "queue",
    badge: "Balanced",
    badgeVariant: "success" as const,
  },
  {
    id: 3,
    title: "Automated daily clinical backup verified",
    details: "Encrypted snapshot created (2.4 GB, SHA-256 ok)",
    time: "1 hour ago",
    type: "system",
    badge: "Completed",
    badgeVariant: "secondary" as const,
  },
  {
    id: 4,
    title: "Pharmacy billing reconciliation batch",
    details: "142 transactions cleared with payment gateway",
    time: "2 hours ago",
    type: "billing",
    badge: "Reconciled",
    badgeVariant: "info" as const,
  },
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const { stats, loading } = useDashboardStats("admin");
  const [isDialogOpen, setIsOpen] = useState(false);
  const [timeframe, setTimeframe] = useState<keyof typeof analyticsDataSets>("Last 7 Days");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Doctor",
    department: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Successfully registered ${formData.name} (${formData.role}) in ${formData.department || "General OPD"}.`);
    setIsOpen(false);
    setFormData({ name: "", email: "", role: "Doctor", department: "" });
  };

  const activeChartData = analyticsDataSets[timeframe];
  const totalVolume = activeChartData.reduce((acc, curr) => acc + curr.visits, 0);
  const avgWait = Math.round(activeChartData.reduce((acc, curr) => acc + curr.waitTime, 0) / activeChartData.length);

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Hospital Administration System</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Hospital Overview</h1>
          <p className="text-sm text-slate-500 font-normal">
            Real-time telemetry, clinical queue utilization, and resource provisioning
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium text-sm shadow-xs"
            onClick={() => alert("Generating automated hospital analytics report...")}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2 text-slate-500" />
            Export Audit
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm shadow-xs transition-all">
                <Plus className="w-4 h-4 mr-1.5" />
                Add Staff Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px] rounded-2xl bg-white border border-slate-200 shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-slate-900">Add Medical or Admin Staff</DialogTitle>
                <DialogDescription className="text-sm text-slate-500">
                  Provision new clinical credentials with role-based access control.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 py-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-slate-600">Full Name</Label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g. Dr. Ayesha Roy"
                      className="pl-9 h-10 rounded-lg border-slate-200 bg-white text-slate-900 focus-visible:border-teal-600 focus-visible:ring-teal-500/20"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-600">Work Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="doctor@medirxcare.in"
                      className="pl-9 h-10 rounded-lg border-slate-200 bg-white text-slate-900 focus-visible:border-teal-600 focus-visible:ring-teal-500/20"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="role" className="text-xs font-semibold uppercase tracking-wider text-slate-600">Role</Label>
                    <select
                      id="role"
                      name="role"
                      className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      value={formData.role}
                      onChange={handleInputChange}
                    >
                      <option value="Doctor">Doctor</option>
                      <option value="Nurse">Nurse</option>
                      <option value="Admin">Administrator</option>
                      <option value="Receptionist">OPD Receptionist</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="department" className="text-xs font-semibold uppercase tracking-wider text-slate-600">Department</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="department"
                        name="department"
                        placeholder="e.g. Cardiology"
                        className="pl-9 h-10 rounded-lg border-slate-200 bg-white text-slate-900 focus-visible:border-teal-600 focus-visible:ring-teal-500/20"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter className="pt-3 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-lg border-slate-200 text-slate-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-10 rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-5 shadow-xs font-medium"
                  >
                    Confirm Registration
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-28 bg-slate-100 animate-pulse rounded-xl border border-slate-200" />
            ))
        ) : (
          <>
            <StatCard
              title="Registered Patients"
              value={stats?.totalPatients || 12480}
              icon={Users}
              trend="+14% this month"
              iconColor="text-teal-700"
              bgColor="bg-teal-50"
            />
            <StatCard
              title="Active Clinicians"
              value={stats?.activeDoctors || 42}
              icon={ShieldCheck}
              trend="3 on leave"
              iconColor="text-emerald-700"
              bgColor="bg-emerald-50"
            />
            <StatCard
              title="Pending Queue Tokens"
              value={stats?.pendingAppointments || 18}
              icon={Calendar}
              trend="4 high priority"
              iconColor="text-amber-700"
              bgColor="bg-amber-50"
            />
            <StatCard
              title="OPD Health Score"
              value={stats?.systemHealth || "99.8%"}
              icon={Activity}
              trend="Latency: 38ms"
              iconColor="text-sky-700"
              bgColor="bg-sky-50"
            />
          </>
        )}
      </div>

      {/* Main Grid: Hospital Analytics & Quick Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hospital Analytics Chart Card */}
        <Card className="lg:col-span-2 p-6 bg-white border border-slate-200/80 rounded-xl shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-700">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h2 className="text-base font-semibold text-slate-900">OPD Footfall & Utilization</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Patient attendance and average waiting duration across departments
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(["Last 7 Days", "Last 30 Days", "Today (Hourly)"] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setTimeframe(period)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    timeframe === period
                      ? "bg-teal-50 border-teal-200 text-teal-800 font-semibold"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-4 mb-6 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Total Visits</p>
              <p className="text-lg font-semibold text-slate-900 mt-0.5">{totalVolume.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Avg Wait Time</p>
              <p className="text-lg font-semibold text-teal-700 mt-0.5">{avgWait} mins</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Efficiency</p>
              <div className="flex items-center gap-1 mt-0.5">
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                <span className="text-lg font-semibold text-emerald-700">+8.4%</span>
              </div>
            </div>
          </div>

          {/* Interactive Recharts Visualization */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tealAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-md text-xs">
                          <p className="font-semibold text-slate-900 mb-1">{label}</p>
                          <div className="flex items-center justify-between gap-4 text-slate-600">
                            <span>Footfall:</span>
                            <span className="font-semibold text-teal-700">{payload[0].value} patients</span>
                          </div>
                          {payload[0].payload.waitTime && (
                            <div className="flex items-center justify-between gap-4 text-slate-600 mt-0.5">
                              <span>Wait Duration:</span>
                              <span className="font-semibold text-slate-900">{payload[0].payload.waitTime} mins</span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="visits" 
                  stroke="#0d9488" 
                  strokeWidth={2.2} 
                  fillOpacity={1} 
                  fill="url(#tealAreaGradient)" 
                  activeDot={{ r: 5, fill: "#0d9488", stroke: "#ffffff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Quick Management Section */}
        <Card className="p-6 bg-white border border-slate-200/80 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-1">Administrative Actions</h2>
            <p className="text-xs text-slate-500 mb-5">Frequently accessed controls and governance modules</p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => navigate("/admin/doctors")}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-teal-500/40 hover:bg-teal-50/20 transition-all text-left group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-700 group-hover:bg-teal-100 transition-colors">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-teal-900">Verify Clinicians</p>
                    <p className="text-xs text-slate-500">Review pending medical credentials</p>
                  </div>
                </div>
                <Badge variant="warning">5 Pending</Badge>
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/payments")}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-teal-500/40 hover:bg-teal-50/20 transition-all text-left group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:bg-slate-200 transition-colors">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-teal-900">Revenue & Billing</p>
                    <p className="text-xs text-slate-500">Reconcile OPD receipts and fees</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/queue-monitoring")}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-teal-500/40 hover:bg-teal-50/20 transition-all text-left group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-100 transition-colors">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-teal-900">Queue Telemetry</p>
                    <p className="text-xs text-slate-500">Live monitor counter load & tokens</p>
                  </div>
                </div>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/settings")}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-teal-500/40 hover:bg-teal-50/20 transition-all text-left group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:bg-slate-200 transition-colors">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-teal-900">Hospital Config</p>
                    <p className="text-xs text-slate-500">Departments, shifts, and security</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
              </button>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-teal-500"></span>
              All clinical APIs operational
            </span>
            <span className="font-mono text-slate-400">v2.4.0</span>
          </div>
        </Card>
      </div>

      {/* Recent System Audit Logs */}
      <Card className="p-6 bg-white border border-slate-200/80 rounded-xl shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">System Audit Trail</h2>
              <p className="text-xs text-slate-500">Chronological security and administration events</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs border-slate-200 text-slate-600 hover:bg-slate-50"
            onClick={() => alert("Loading complete audit trail...")}
          >
            View Full Log
          </Button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentSystemLogs.map((log) => (
            <div key={log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-md bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-500 mt-0.5 flex-shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{log.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{log.details}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-center">
                <Badge variant={log.badgeVariant}>{log.badge}</Badge>
                <span className="text-xs font-mono text-slate-400 whitespace-nowrap">{log.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
