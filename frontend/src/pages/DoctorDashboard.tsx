import { Calendar, Clock, Video, Users, Activity, CheckCircle, FileText, Timer, BarChart3, ChevronRight, Stethoscope, ArrowRight } from "lucide-react";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useAppointments } from "../hooks/useAppointments";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useQueue } from "../hooks/useQueue";
import { StatCard } from "../components/dashboard/StatCard";
import { queueService } from "../services/QueueService";

export function DoctorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { appointments, loading: appointmentsLoading } = useAppointments('doctor');
  const { stats, loading: statsLoading } = useDashboardStats('doctor');
  const { queue, loading: queueLoading, refresh: refreshQueue } = useQueue();

  const handleAdvanceQueue = async () => {
    try {
      await queueService.nextPatient();
      await refreshQueue();
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
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">On-Duty Clinician</span>
              <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs text-slate-500">OPD Consultation Wing</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Welcome, {user?.name || "Dr. Aarav Mehta"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              You have <strong className="text-slate-900 dark:text-slate-100 font-semibold">{stats?.todaysAppointments || appointments.length} appointments</strong> scheduled for today's roster.
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
          {/* Today's Queue Stream */}
          <Card className="p-6 bg-white border border-slate-200/80 shadow-xs dark:bg-slate-950 dark:border-slate-800">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700 border border-teal-200/60 dark:bg-teal-950/40 dark:text-teal-300">
                  <Calendar className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">Patient Queue Stream</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{appointments.length} patients scheduled today</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">Live Schedule</Badge>
            </div>

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
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{appointment.reason || "General Consultation"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-4 mt-3 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                        <div className="text-right">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {appointment.time}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {appointment.mode === "Video" ? "Video Visit" : "In-Person OPD"}
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
                <p className="py-8 text-center text-xs text-slate-400">No scheduled patients in the queue.</p>
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
