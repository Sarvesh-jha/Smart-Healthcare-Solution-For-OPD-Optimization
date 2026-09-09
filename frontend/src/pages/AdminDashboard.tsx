import { useState, useEffect } from "react";
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
  CheckCircle2,
  Mail, 
  Briefcase, 
  Plus, 
  ArrowUpRight, 
  Clock, 
  FileSpreadsheet,
  AlertTriangle,
  Siren,
  Ambulance,
  PhoneCall,
  MapPin,
  Radio,
  X
} from "lucide-react";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Label } from "../components/common/Label";
import { Badge } from "../components/common/Badge";
import { useNavigate } from "react-router";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { StatCard } from "../components/dashboard/StatCard";
import { socketService, EmergencyPayload } from "../services/SocketService";
import { emergencyService } from "../services/EmergencyService";
import { toast } from "sonner";
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

  const [emergencies, setEmergencies] = useState<EmergencyPayload[]>([]);
  const [activeAlert, setActiveAlert] = useState<EmergencyPayload | null>(null);
  const [isDispatching, setIsDispatching] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState<string | null>(null);

  const playEmergencyChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(960, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Browser audio autoplay policy handled safely
    }
  };

  useEffect(() => {
    socketService.joinAdminRoom();

    const fetchIncidents = async () => {
      try {
        const res = await emergencyService.getIncidents();
        if (res?.incidents) {
          setEmergencies(res.incidents);
          const active = res.incidents.find(
            (i) => i.status === "PENDING_RESPONSE" || i.status === "Acknowledged" || i.status === "Dispatched"
          );
          if (active) {
            setActiveAlert(active);
          }
        }
      } catch (e) {
        console.warn("Failed to load emergency incidents:", e);
      }
    };

    fetchIncidents();

    // Real-time listener for incoming SOS triggers from patient portal
    const unsubAlert = socketService.onIncomingEmergencyAlert((incoming) => {
      playEmergencyChime();
      toast.error(`🚨 CRITICAL SOS ALERT: Emergency triggered by ${incoming.patientName} (${incoming.contactNumber || incoming.contact || "Patient"})`);
      setActiveAlert(incoming);
      setEmergencies((prev) => [
        incoming,
        ...prev.filter((item) => (item._id || item.id) !== (incoming._id || incoming.id)),
      ]);
    });

    const unsubUpdate = socketService.onEmergencyUpdated((updated) => {
      setEmergencies((prev) =>
        prev.map((item) => ((item._id || item.id) === (updated._id || updated.id) ? { ...item, ...updated } : item))
      );
      setActiveAlert((curr) => {
        if (!curr) return null;
        if ((curr._id || curr.id) === (updated._id || updated.id)) {
          if (updated.status === "Resolved") return null;
          return { ...curr, ...updated };
        }
        return curr;
      });
    });

    return () => {
      unsubAlert();
      unsubUpdate();
    };
  }, []);

  const handleAcknowledgeAndDispatch = async (incidentId: string) => {
    try {
      setIsDispatching(incidentId);
      const res = await emergencyService.dispatch(incidentId, "Ambulance dispatched by Administrator");
      toast.success("Ambulance dispatched & Incident acknowledged!");
      if (res?.emergency) {
        setEmergencies((prev) =>
          prev.map((i) => ((i._id || i.id) === incidentId ? { ...i, ...res.emergency } : i))
        );
        if (activeAlert && (activeAlert._id === incidentId || activeAlert.id === incidentId)) {
          setActiveAlert({ ...activeAlert, ...res.emergency });
        }
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to dispatch ambulance.");
    } finally {
      setIsDispatching(null);
    }
  };

  const handleResolveIncident = async (incidentId: string) => {
    try {
      setIsResolving(incidentId);
      const res = await emergencyService.resolve(incidentId, "Emergency resolved by Admin");
      toast.success("Emergency incident marked as Resolved.");
      if (res?.emergency) {
        setEmergencies((prev) =>
          prev.map((i) => ((i._id || i.id) === incidentId ? { ...i, ...res.emergency } : i))
        );
        if (activeAlert && (activeAlert._id === incidentId || activeAlert.id === incidentId)) {
          setActiveAlert(null);
        }
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to resolve incident.");
    } finally {
      setIsResolving(null);
    }
  };

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
      {/* High-Priority Real-Time Emergency SOS Alert Banner */}
      {activeAlert && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-red-500 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-5 shadow-2xl shadow-red-600/30 animate-pulse">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur shrink-0 shadow-inner">
                <Siren className="h-7 w-7 text-white animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white text-red-700 shadow-xs">
                    LIVE SOS ALERT
                  </span>
                  <span className="text-xs text-red-100 font-mono">
                    Ref: {activeAlert._id || activeAlert.id || "EMG-ALERT"}
                  </span>
                </div>
                <h2 className="text-lg font-black tracking-tight text-white mt-1">
                  🚨 CRITICAL SOS ALERT: Emergency triggered by {activeAlert.patientName} (
                  {activeAlert.contactNumber || activeAlert.contact || "No Phone Recorded"})
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-red-100 mt-1.5">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    {typeof activeAlert.location === "object"
                      ? activeAlert.location.address || `${activeAlert.location.latitude?.toFixed(4)}, ${activeAlert.location.longitude?.toFixed(4)}`
                      : activeAlert.location || "Coordinates Received"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium">
                    <Ambulance className="w-3.5 h-3.5" />
                    {activeAlert.hospital?.name || "Assigned Trauma Center"} (ETA: {activeAlert.hospital?.eta || "8-12 mins"})
                  </span>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded-md font-bold bg-white/25 text-white">
                    Status: {activeAlert.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center shrink-0">
              <Button
                onClick={() => handleAcknowledgeAndDispatch(activeAlert._id || activeAlert.id || "")}
                disabled={isDispatching === (activeAlert._id || activeAlert.id)}
                className="h-10 rounded-xl bg-white hover:bg-slate-100 text-red-700 font-bold text-xs shadow-md border border-white"
              >
                <Ambulance className="w-4 h-4 mr-1.5" />
                {isDispatching === (activeAlert._id || activeAlert.id)
                  ? "Dispatching..."
                  : activeAlert.status === "Dispatched"
                  ? "Ambulance Dispatched"
                  : "Acknowledge & Dispatch Ambulance"}
              </Button>

              {activeAlert.contactNumber || activeAlert.contact ? (
                <a
                  href={`tel:${activeAlert.contactNumber || activeAlert.contact}`}
                  className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-red-800/80 hover:bg-red-800 text-white font-bold text-xs border border-red-400/40 shadow-sm transition-colors"
                >
                  <PhoneCall className="w-4 h-4 mr-1.5" />
                  Contact Patient
                </a>
              ) : null}

              <Button
                onClick={() => handleResolveIncident(activeAlert._id || activeAlert.id || "")}
                disabled={isResolving === (activeAlert._id || activeAlert.id)}
                variant="outline"
                className="h-10 rounded-xl bg-red-950/40 hover:bg-red-950 text-white border-red-400/30 text-xs font-semibold"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                {isResolving === (activeAlert._id || activeAlert.id) ? "Resolving..." : "Resolve Incident"}
              </Button>

              <button
                onClick={() => setActiveAlert(null)}
                className="p-2 rounded-xl text-red-200 hover:text-white hover:bg-white/10 transition-colors"
                title="Dismiss Alert Banner"
                aria-label="Dismiss Alert Banner"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 pt-1">
            Hospital Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-normal mt-1">
            Monitor active queues, clinical staff availability, and emergency tickets.
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

      {/* Live Emergency SOS Operations & Incident Log */}
      <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 dark:bg-red-950/50 dark:border-red-900">
              <Siren className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
                  Live Emergency SOS Operations & Incident Log
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Incoming emergency alerts, dispatch updates, and responder status
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              {emergencies.filter((e) => e.status !== "Resolved").length} Active Incident(s)
            </Badge>
          </div>
        </div>

        {emergencies.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl dark:border-slate-800">
            <ShieldCheck className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Active Emergency Incidents</p>
            <p className="text-xs text-slate-400 mt-0.5">Emergency SOS triggers from the patient portal will stream here in real time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Patient & Ref ID</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Assigned Hub / ETA</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Triggered</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {emergencies.map((incident) => {
                  const id = incident._id || incident.id || "";
                  const locationStr =
                    typeof incident.location === "object"
                      ? incident.location.address || `${incident.location.latitude?.toFixed(4)}, ${incident.location.longitude?.toFixed(4)}`
                      : incident.location || "Indiranagar, Bengaluru";
                  return (
                    <tr key={id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{incident.patientName}</p>
                        <p className="font-mono text-[10px] text-slate-400 mt-0.5">{id.slice(-8)}</p>
                      </td>
                      <td className="py-3.5 px-3">
                        <a
                          href={`tel:${incident.contactNumber || incident.contact}`}
                          className="inline-flex items-center gap-1 font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          {incident.contactNumber || incident.contact || "+91 98765 00000"}
                        </a>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{locationStr}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {incident.hospital?.name || "Trauma Response Hub"}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          ETA: {incident.hospital?.eta || "8-12 mins"}
                        </p>
                      </td>
                      <td className="py-3.5 px-3">
                        {incident.status === "PENDING_RESPONSE" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-300 animate-pulse dark:bg-red-950/60 dark:text-red-300 dark:border-red-800">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                            Pending Response
                          </span>
                        )}
                        {incident.status === "Acknowledged" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                            Acknowledged
                          </span>
                        )}
                        {incident.status === "Dispatched" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                            <Ambulance className="w-3.5 h-3.5" />
                            Dispatched
                          </span>
                        )}
                        {incident.status === "Resolved" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Resolved
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-500 dark:text-slate-400">
                        {incident.createdAt ? new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {incident.status !== "Resolved" && incident.status !== "Dispatched" && (
                            <Button
                              size="sm"
                              onClick={() => handleAcknowledgeAndDispatch(id)}
                              disabled={isDispatching === id}
                              className="h-8 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs px-2.5 font-semibold shadow-xs"
                            >
                              <Ambulance className="w-3.5 h-3.5 mr-1" />
                              Dispatch
                            </Button>
                          )}
                          {incident.status !== "Resolved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolveIncident(id)}
                              disabled={isResolving === id}
                              className="h-8 rounded-lg text-xs px-2.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Resolve
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

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
                onClick={() => navigate("/admin/analytics")}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-teal-500/40 hover:bg-teal-50/20 transition-all text-left group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-50 border border-cyan-200/60 flex items-center justify-center text-cyan-700 group-hover:bg-cyan-100 transition-colors">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-teal-900">Hospital Analytics</p>
                    <p className="text-xs text-slate-500">Department distribution and footfall trends</p>
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
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-teal-900 dark:group-hover:text-teal-400">Queue Monitoring</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Monitor OPD wait times and active tokens</p>
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
