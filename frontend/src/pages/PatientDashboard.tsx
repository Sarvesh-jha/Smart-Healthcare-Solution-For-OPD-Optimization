import { Activity, Calendar, FileText, Video } from "lucide-react";
import { useNavigate } from "react-router";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { QueueStatus } from "../components/dashboard/QueueStatus";
import { GreetingSection } from "../components/dashboard/GreetingSection";
import { RecentActivityCard } from "../components/dashboard/RecentActivityCard";
import { useAppointments } from "../hooks/useAppointments";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useAuth } from "../context/AuthContext";
import { CareAssistantLogo } from "../components/icons/CareAssistantLogo";
import { DoctorSearchLogo } from "../components/icons/DoctorSearchLogo";

const quickActions = [
  { name: "Book Appointment", icon: Calendar, path: "/dashboard/book-appointment", tag: "OPD / Video" },
  { name: "Find Doctors", icon: DoctorSearchLogo, path: "/dashboard/doctor-directory", tag: "Specialists" },
  { name: "Medical Reports", icon: FileText, path: "/dashboard/reports", tag: "Prescriptions" },
  { name: "Clinical AI Guide", icon: CareAssistantLogo, path: "/dashboard/ai-doctor", tag: "Care Assistant" },
];

const getActivityIcon = (title: string) => {
  if (title.includes("Prescription")) return FileText;
  if (title.includes("Appointment")) return Calendar;
  return Activity;
};

const getActivityColor = (title: string) => {
  if (title.includes("Prescription")) return { color: "text-blue-600", bgColor: "bg-blue-50" };
  if (title.includes("Appointment")) return { color: "text-teal-600", bgColor: "bg-teal-50" };
  return { color: "text-emerald-600", bgColor: "bg-emerald-50" };
};

export function PatientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { appointments, loading: appointmentsLoading } = useAppointments("patient");
  const { stats, loading: statsLoading } = useDashboardStats("patient");

  return (
    <div className="space-y-6 pb-10">
      <GreetingSection
        name={user?.name?.split(" ")[0] || "Patient"}
        message="Track your queue, upcoming visits, and care guidance from one unified patient workspace."
      />

      {/* Patient Shortcuts Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.name}
              type="button"
              onClick={() => navigate(action.path)}
              className="group flex flex-col justify-between p-5 text-left rounded-xl border border-slate-200/80 bg-white shadow-xs transition-all hover:border-teal-300 hover:shadow-sm dark:bg-[#131926] dark:border-slate-800/80 dark:hover:border-teal-800"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700 border border-teal-200/60 dark:bg-teal-950/40 dark:text-teal-300">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-md border border-slate-200/60 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-500 transition-colors group-hover:border-teal-200 group-hover:bg-teal-50 group-hover:text-teal-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:border-teal-800 dark:group-hover:bg-teal-950/50 dark:group-hover:text-teal-300">
                  {action.tag}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-teal-900 dark:text-slate-100 dark:group-hover:text-teal-200">
                  {action.name}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Hero Live OPD Queue Section */}
      <section>
        <QueueStatus />
      </section>

      {/* Activity and Upcoming Appointments */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Recent Activity Card */}
        <Card className="p-6 bg-white border border-slate-200/80 shadow-xs dark:bg-[#131926] dark:border-slate-800/80">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Activity className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Recent Activity</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Consultations, follow-ups, and latest medical events</p>
            </div>
          </div>

          <div className="space-y-3">
            {statsLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
              ))
            ) : stats?.recentActivity?.length ? (
              stats.recentActivity.map((activity: any) => {
                const styles = getActivityColor(activity.title);
                return (
                  <RecentActivityCard
                    key={activity.id}
                    title={activity.title}
                    description={activity.description}
                    time={activity.time}
                    icon={getActivityIcon(activity.title)}
                    color={styles.color}
                    bgColor={styles.bgColor}
                  />
                );
              })
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                Recent medical interactions and prescription updates will appear here.
              </div>
            )}
          </div>
        </Card>

        {/* Upcoming Appointments Card */}
        <Card className="p-6 bg-white border border-slate-200/80 shadow-xs dark:bg-[#131926] dark:border-slate-800/80">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700 border border-teal-200/60 dark:bg-teal-950/40 dark:text-teal-300">
                <Calendar className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Upcoming Appointments</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Scheduled consultant appointments and video visits</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => navigate("/dashboard/book-appointment")}
            >
              Book New
            </Button>
          </div>

          <div className="space-y-3">
            {appointmentsLoading ? (
              Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
              ))
            ) : appointments.length ? (
              appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-lg border border-slate-200/70 bg-white p-4 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{appointment.doctor}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{appointment.specialty}</p>
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <span>{appointment.date}</span>
                        <span>•</span>
                        <span>{appointment.time}</span>
                        <span>•</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{appointment.mode}</span>
                      </p>
                    </div>
                    <Badge
                      variant={
                        appointment.status === "completed"
                          ? "success"
                          : appointment.status === "ongoing"
                            ? "info"
                            : "secondary"
                      }
                    >
                      {appointment.status}
                    </Badge>
                  </div>

                  <div className="mt-3.5 flex items-center gap-2">
                    {appointment.mode === "Video" ? (
                      <Button
                        size="sm"
                        onClick={() => navigate(`/dashboard/consultation/${appointment.id}`)}
                        className="h-8 text-xs gap-1.5"
                      >
                        <Video className="h-3.5 w-3.5" />
                        Join Call
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/dashboard/live-queue")}
                        className="h-8 text-xs"
                      >
                        Track Position
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-6 text-center">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Upcoming Visits Scheduled</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">Book an in-person or video consultation with our on-duty specialists.</p>
                <Button
                  size="sm"
                  onClick={() => navigate("/dashboard/book-appointment")}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8 px-4 rounded-lg shadow-xs"
                >
                  Book an Appointment
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
