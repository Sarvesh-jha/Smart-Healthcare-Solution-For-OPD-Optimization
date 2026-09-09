import { Activity, CalendarClock, CheckCircle2, Clock3, Hash, RefreshCw, Route, Users, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { useQueue } from "../../hooks/useQueue";
import { LoadingSpinner } from "../common/LoadingSpinner";

export function QueueStatus() {
  const navigate = useNavigate();
  const { queue, loading, error, refresh } = useQueue();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Card className="rounded-xl border border-rose-200 bg-rose-50/60 p-5 shadow-xs">
        <p className="text-sm font-medium text-rose-700">{error}</p>
      </Card>
    );
  }

  if (!queue?.patientToken) {
    return (
      <Card className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[11px]">OPD Queue</Badge>
              <span className="text-xs text-slate-400">• Standby</span>
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">No Active OPD Queue</h3>
            <p className="max-w-xl text-sm text-slate-500 dark:text-slate-400">
              When you book an in-person consultation, live queue tracking and real-time wait estimations will update here.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 sm:self-center">
            <Button
              onClick={() => navigate("/dashboard/book-appointment")}
              className="h-9 px-4 text-xs font-medium"
            >
              Book Appointment
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/doctor-directory")}
              className="h-9 px-4 text-xs font-medium"
            >
              Find Doctors
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const patientsAhead = queue.patientsAhead ?? 0;
  const queueProgress = Math.min(100, ((queue.patientToken - patientsAhead) / Math.max(queue.patientToken, 1)) * 100);
  const isServingNow = queue.patientStatus === "serving";

  return (
    <Card className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs dark:bg-slate-900 dark:border-slate-800">
      {/* Header bar with live pulse */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-6 py-3.5 dark:border-slate-800/80 dark:bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Live OPD Queue</span>
          <span className="text-xs text-slate-300 dark:text-slate-700">|</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{queue.queueDateLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refresh()}
            className="h-8 gap-1.5 px-2.5 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sync</span>
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prominent Dual Token Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Currently Serving Token */}
          <div className="flex items-center justify-between p-5 rounded-xl border border-slate-200/70 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Currently Serving</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {queue.isToday && queue.currentServing ? `#${queue.currentServing}` : "Starting Soon"}
              </p>
              <div className="mt-2">
                <Badge variant={queue.currentServing ? "success" : "secondary"}>
                  {queue.currentServing ? "Active in Consultation" : "Queue Standby"}
                </Badge>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Activity className="h-6 w-6" />
            </div>
          </div>

          {/* Patient's Token */}
          <div className={`flex items-center justify-between p-5 rounded-xl border transition-all ${
            isServingNow 
              ? "border-emerald-300 bg-emerald-50/40 dark:border-emerald-800/80 dark:bg-emerald-950/20" 
              : "border-teal-200/80 bg-teal-50/30 dark:border-teal-900/60 dark:bg-teal-950/20"
          }`}>
            <div>
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400">Your Assigned Token</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-teal-950 dark:text-teal-50">
                #{queue.patientToken}
              </p>
              <div className="mt-2">
                <Badge variant={isServingNow ? "success" : "warning"}>
                  {isServingNow ? "Your Turn Now!" : `${patientsAhead} patient${patientsAhead === 1 ? "" : "s"} ahead`}
                </Badge>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
              <Hash className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Minimalist Wait Time Progress Indicator */}
        <div className="rounded-xl border border-slate-200/70 bg-white p-4.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-2.5">
            <span className="flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5 text-slate-400" />
              Est. Waiting Time: <span className="font-semibold text-slate-900 dark:text-slate-100">{queue.estimatedWaitTime}</span>
            </span>
            <span className="text-slate-400">{Math.round(queueProgress)}% Completed</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-teal-600 transition-all duration-500 ease-out"
              style={{ width: `${Math.max(5, queueProgress)}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Clinic Opening</span>
            <span>Slot: {queue.appointmentTime || "Scheduled"}</span>
            <span>Token #{queue.patientToken}</span>
          </div>
        </div>

        {/* Doctor and Action Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{queue.doctorName || "Consultant"}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{queue.appointmentReason || "General Visit"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => navigate("/dashboard/live-queue")}
              className="h-9 px-4 text-xs font-medium gap-1.5"
            >
              <Route className="h-3.5 w-3.5" />
              Full Queue View
            </Button>
            {isServingNow && (
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard/book-appointment")}
                className="h-9 border-emerald-300 bg-emerald-50/60 text-emerald-700 hover:bg-emerald-100 text-xs font-medium"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Proceed to Doctor
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
