import { useMemo, useState } from "react";
import { Calendar, Clock, Video, Users, Activity, CheckCircle, FileText, Timer, BarChart3, ChevronRight, Stethoscope, ArrowRight } from "lucide-react";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useAppointments, UseAppointmentsOptions } from "../hooks/useAppointments";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useQueue } from "../hooks/useQueue";
import { StatCard } from "../components/dashboard/StatCard";
import { queueService } from "../services/QueueService";

export function DoctorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [filterTab, setFilterTab] = useState<"today" | "tomorrow" | "upcoming">("today");

  const tomorrowDateObj = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }, []);
  const tomorrowDateISO = useMemo(() => tomorrowDateObj.toISOString().split("T")[0], [tomorrowDateObj]);
  const tomorrowDateLabel = useMemo(() => {
    return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(tomorrowDateObj);
  }, [tomorrowDateObj]);

  const appointmentOptions = useMemo<UseAppointmentsOptions>(() => {
    if (filterTab === "tomorrow") {
      return { date: tomorrowDateISO, view: "tomorrow" };
    }
    if (filterTab === "upcoming") {
      return { view: "upcoming" };
    }
    return { view: "today" };
  }, [filterTab, tomorrowDateISO]);

  const { appointments, loading: appointmentsLoading, refresh: refreshAppointments } = useAppointments("doctor", appointmentOptions);
  const { stats, loading: statsLoading, refresh: refreshStats } = useDashboardStats("doctor");
  const queueDate = filterTab === "tomorrow" ? tomorrowDateISO : undefined;
  const { queue, loading: queueLoading, refresh: refreshQueue } = useQueue({ date: queueDate });

  const handleAdvanceQueue = async () => {
    try {
      await queueService.nextPatient();
      await refreshQueue();
      await refreshAppointments();
      await refreshStats();
    } catch (error) {
      console.error("Failed to advance queue:", error);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Clinician Header Section */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs dark:bg-slate-950 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Welcome, {user?.name || "Dr. Aarav Mehta"}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                On-Duty
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {filterTab === "today" && (
                <>
                  You have <strong className="text-slate-900 dark:text-slate-100 font-semibold">{stats?.todaysAppointments || appointments.length} appointments</strong> scheduled for today's roster.
                  {(stats?.totalUpcoming || 0) > (stats?.todaysAppointments || 0) && (
                    <span className="ml-1 text-teal-600 dark:text-teal-400 font-medium">
                      ({(stats?.totalUpcoming || 0) - (stats?.todaysAppointments || 0)} upcoming on future dates)
                    </span>
                  )}
                </>
              )}
              {filterTab === "tomorrow" && (
                <>
                  Viewing roster for <strong className="text-slate-900 dark:text-slate-100 font-semibold">Tomorrow ({tomorrowDateLabel})</strong> with{" "}
                  <strong className="text-teal-600 dark:text-teal-400 font-semibold">{appointments.length} scheduled appointment{appointments.length === 1 ? "" : "s"}</strong>.
                </>
              )}
              {filterTab === "upcoming" && (
                <>
                  Viewing <strong className="text-slate-900 dark:text-slate-100 font-semibold">All Upcoming Appointments</strong> ({appointments.length} total scheduled).
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/doctor/write-prescription")}
              className="h-9 px-4 text-xs font-medium gap-1.5"
            >
              <FileText className="h-3.5 w-3.5" />
              Write Prescription
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Appointments & Queue Stream */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Queue Stream Card */}
          <Card className="p-6 bg-white border border-slate-200/80 shadow-xs dark:bg-slate-950 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700 border border-teal-200/60 dark:bg-teal-950/40 dark:text-teal-300">
                  <Calendar className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                    {filterTab === "today"
                      ? "Patient Queue Stream"
                      : filterTab === "tomorrow"
                      ? `Tomorrow's Roster (${tomorrowDateLabel})`
                      : "Upcoming Appointments Stream"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {appointments.length} {appointments.length === 1 ? "patient" : "patients"} {filterTab === "today" ? "scheduled today" : filterTab === "tomorrow" ? `booked for ${tomorrowDateLabel}` : "in upcoming schedule"}
                  </p>
                </div>
              </div>

              {/* Date Filter Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFilterTab("today")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    filterTab === "today"
                      ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  Today {stats?.todaysAppointments !== undefined ? `(${stats.todaysAppointments})` : ""}
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("tomorrow")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    filterTab === "tomorrow"
                      ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  Tomorrow ({tomorrowDateLabel})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("upcoming")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    filterTab === "upcoming"
                      ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  All Upcoming
                </button>
              </div>
            </div>

            {/* If Today is empty but upcoming appointments exist, show helpful switcher banner */}
            {filterTab === "today" && !appointmentsLoading && appointments.length === 0 && (stats?.totalUpcoming || 0) > 0 && (
              <div className="mb-4 p-3.5 rounded-xl border border-teal-200/80 bg-teal-50/50 dark:bg-teal-950/20 dark:border-teal-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  <p className="text-xs text-teal-900 dark:text-teal-200">
                    No patients scheduled today, but you have{" "}
                    <strong className="font-semibold">{stats?.totalUpcoming} appointment{(stats?.totalUpcoming || 0) > 1 ? "s" : ""}</strong> booked for upcoming dates.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setFilterTab("tomorrow")}
                  className="h-7 text-xs border-teal-300 text-teal-700 hover:bg-teal-100/50 dark:border-teal-700 dark:text-teal-300 shrink-0 self-start sm:self-auto"
                >
                  View Tomorrow ({tomorrowDateLabel})
                </Button>
              </div>
            )}

            <div className="space-y-2.5">
              {appointmentsLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-lg dark:bg-slate-900" />
                ))
              ) : appointments.length ? (
                appointments.map((appointment) => {
                  const isCompleted = appointment.status === "completed";
                  const isOngoing = appointment.status === "ongoing";

                  return (
                    <div 
                      key={appointment.id} 
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border transition-all ${
                        isOngoing 
                          ? "border-teal-300 bg-teal-50/30 dark:border-teal-800 dark:bg-teal-950/20 shadow-xs" 
                          : "border-slate-200/70 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center border border-slate-200/60 shrink-0 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                          {appointment.patient.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-900 text-sm truncate dark:text-slate-100">{appointment.patient}</p>
                            <Badge
                              variant={
                                isCompleted
                                  ? "success"
                                  : isOngoing
                                  ? "default"
                                  : "warning"
                              }
                            >
                              {appointment.status}
                            </Badge>
                            {appointment.mode && (
                              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                {appointment.mode === "Video" ? "Video" : "In-Person"}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{appointment.reason || "General Consultation"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-4 mt-3 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                        <div className="text-right">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {appointment.timeSlot || appointment.time}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-end gap-1">
                            {appointment.date && (
                              <span className="font-medium text-teal-600 dark:text-teal-400">{appointment.date}</span>
                            )}
                            <span>•</span>
                            <span>{appointment.mode === "Video" ? "Video Visit" : "In-Person OPD"}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          {appointment.mode === 'Video' && !isCompleted && (
                            <Button
                              size="sm"
                              onClick={() => navigate(`/doctor/consultation/${appointment.id}`)}
                              className="h-8 px-3 text-xs gap-1 font-medium"
                            >
                              <Video className="w-3 h-3" />
                              {isOngoing ? "Resume" : "Call Next"}
                            </Button>
                          )}

                          {!isCompleted && appointment.mode !== 'Video' && (
                            <Button
                              size="sm"
                              onClick={handleAdvanceQueue}
                              className="h-8 px-3 text-xs font-medium"
                            >
                              Call Next
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-slate-500 hover:text-slate-900"
                            onClick={() => navigate(`/doctor/patient-history`)}
                          >
                            History
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-10 text-center">
                  <p className="text-xs text-slate-400">
                    No scheduled patients {filterTab === "today" ? "in today's queue" : filterTab === "tomorrow" ? `for ${tomorrowDateLabel}` : "in upcoming schedule"}.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Live Queue OPD Control */}
          <Card className="p-6 bg-white border border-slate-200/80 shadow-xs dark:bg-slate-950 dark:border-slate-800">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <Activity className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">Active OPD Queue Control</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Manage turn advancements and room flow</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refreshQueue()}
                className="h-8 text-xs text-slate-500"
              >
                Sync
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Current Serving Tile */}
              <div className="rounded-xl border border-teal-200/80 bg-teal-50/30 p-5 dark:border-teal-900/50 dark:bg-teal-950/20">
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300 mb-3">Currently in Consultation</p>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-600 text-white font-bold text-2xl shadow-xs">
                    {queue?.currentServing || "—"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 text-base truncate">
                      {queue?.currentPatient?.name || "Queue Idle / Next Ready"}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {queue?.currentPatient?.reason || "Waiting to advance"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAdvanceQueue}
                    className="flex-1 h-9 text-xs font-medium gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Mark Consultation Done
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleAdvanceQueue}
                    className="h-9 px-3 text-xs text-slate-600 hover:text-slate-900"
                  >
                    Skip
                  </Button>
                </div>
              </div>

              {/* Queue Progress Tile */}
              <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-5 flex flex-col justify-between dark:border-slate-800 dark:bg-slate-900/50">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Roster Progress</p>
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <span>Completed Patients</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-50">{queue?.completed || 0} / {queue?.totalToday || 0}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden dark:bg-slate-800">
                    <div 
                      className="bg-teal-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max(5, ((queue?.completed || 0) / (queue?.totalToday || 1)) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 mt-4 text-xs text-slate-500">
                  Estimated next wait: <strong className="text-slate-800 dark:text-slate-200">{queue?.estimatedWaitTime || "15 mins"}</strong>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Stats & Shortcuts */}
        <div className="space-y-6">
          {/* Clinical Prescription Quick Launch */}
          <Card className="p-5 bg-white border border-slate-200/80 shadow-xs dark:bg-slate-950 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700 border border-teal-200/60 dark:bg-teal-950/40 dark:text-teal-300">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Digital Prescription</h3>
                <p className="text-xs text-slate-500">Generate e-prescriptions</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Create instant compliant prescriptions with automated medicine dosage formatting and lab tests.
            </p>
            <Button
              className="w-full h-9 text-xs font-medium"
              onClick={() => navigate("/doctor/write-prescription")}
            >
              New Prescription
            </Button>
          </Card>

          {/* Today's KPI Metrics */}
          <div className="space-y-3">
            {statsLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-xl dark:bg-slate-900" />
              ))
            ) : (
              <>
                <StatCard 
                  title="Completed Consultations" 
                  value={stats?.completedConsultations || 0} 
                  icon={CheckCircle} 
                  trend="Target on track"
                />
                <StatCard 
                  title="Waiting in OPD" 
                  value={stats?.waitingPatients || 0} 
                  icon={Users} 
                  trend="Live queue"
                />
                <StatCard 
                  title="Avg. Consultation Time" 
                  value={stats?.avgConsultationTime || 12} 
                  unit="min"
                  icon={Timer} 
                  trend="Fast throughput"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
