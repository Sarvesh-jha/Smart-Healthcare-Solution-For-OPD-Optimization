import { useMemo, useState } from "react";
import { Clock, Video, Users, Calendar } from "lucide-react";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { useAppointments, UseAppointmentsOptions } from "../hooks/useAppointments";
import { useNavigate } from "react-router";

export function DoctorAppointments() {
  const navigate = useNavigate();
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

  const { appointments, loading } = useAppointments("doctor", appointmentOptions);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {filterTab === "today"
              ? "Today's Appointments"
              : filterTab === "tomorrow"
              ? `Tomorrow's Appointments (${tomorrowDateLabel})`
              : "All Scheduled Appointments"}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Manage consultations and patient queues across your scheduled roster
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterTab("today")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterTab === "today"
                ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("tomorrow")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterTab === "upcoming"
                ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            All Upcoming
          </button>
        </div>
      </div>

      <Card className="border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-950 rounded-2xl">
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-xl bg-slate-50 dark:bg-slate-900" />
            ))
          ) : appointments.length ? (
            appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200/70 bg-white p-4 transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60"
              >
                <div className="min-w-0 flex flex-1 items-center gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-500 text-sm font-semibold text-white shadow-xs">
                    {appointment.patient.split(" ").map((name: string) => name[0]).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">{appointment.patient}</p>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {appointment.mode === "Video" ? "Video" : "In-Person"}
                      </span>
                    </div>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400 mt-0.5">{appointment.reason || "General Consultation"}</p>
                  </div>
                </div>

                <div className="flex flex-shrink-0 items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="text-right">
                    <div className="mb-0.5 flex items-center justify-end gap-1.5 text-xs font-medium text-slate-900 dark:text-slate-50">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {appointment.timeSlot || appointment.time}
                    </div>
                    <div className="flex items-center justify-end gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                      {appointment.date && (
                        <span className="font-medium text-teal-600 dark:text-teal-400">{appointment.date}</span>
                      )}
                      <span>•</span>
                      <span>{appointment.mode === "Video" ? "Video Call" : "In-Person OPD"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        appointment.status === "completed"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : appointment.status === "confirmed" || appointment.status === "scheduled"
                            ? "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                      }`}
                    >
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                    {appointment.mode === "Video" && appointment.status !== "completed" && (
                      <Button
                        size="sm"
                        onClick={() => navigate(`/doctor/consultation/${appointment.id}`)}
                        className="h-8 px-3 text-xs font-medium bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        {appointment.status === "ongoing" ? "Join" : "Start"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No appointments scheduled {filterTab === "today" ? "for today" : filterTab === "tomorrow" ? `for ${tomorrowDateLabel}` : "in upcoming roster"}.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
