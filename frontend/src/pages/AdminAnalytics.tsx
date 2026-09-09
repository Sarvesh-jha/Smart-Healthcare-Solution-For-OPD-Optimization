import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, Calendar, Activity, IndianRupee, AlertCircle, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart,
  Area
} from "recharts";
import { formatINR } from "../utils/currency";
import { api } from "../services/ApiService";

interface QuickStats {
  totalPatients: number;
  activeDoctors: number;
  totalAppointments: number;
  totalRevenue: number;
}

interface AnalyticsData {
  quickStats: QuickStats;
  appointmentData: Array<{ name: string; count: number }>;
  departmentData: Array<{ name: string; patients: number }>;
}

export function AdminAnalytics() {
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsData>({
    quickStats: {
      totalPatients: 0,
      activeDoctors: 0,
      totalAppointments: 0,
      totalRevenue: 0,
    },
    appointmentData: [
      { name: "Mon", count: 0 },
      { name: "Tue", count: 0 },
      { name: "Wed", count: 0 },
      { name: "Thu", count: 0 },
      { name: "Fri", count: 0 },
      { name: "Sat", count: 0 },
      { name: "Sun", count: 0 },
    ],
    departmentData: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchAnalytics() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await api.get<{
          success: boolean;
          quickStats: QuickStats;
          appointmentData: Array<{ name: string; count: number }>;
          departmentData: Array<{ name: string; patients: number }>;
        }>("/dashboard/admin/analytics");

        if (!isMounted) return;

        if (res.success) {
          setData({
            quickStats: res.quickStats || {
              totalPatients: 0,
              activeDoctors: 0,
              totalAppointments: 0,
              totalRevenue: 0,
            },
            appointmentData: res.appointmentData || [],
            departmentData: res.departmentData || [],
          });
        }
      } catch (err: any) {
        console.error("Failed to load admin analytics:", err);
        if (isMounted) {
          setError(err.message || "Failed to load clinical analytics.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  const hasConsultations = data.quickStats.totalAppointments > 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Hospital Analytics</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Live clinical performance metrics, patient footfall, and department analytics</p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-12 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-center rounded-2xl">
          <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400 text-sm">Aggregating hospital metrics...</p>
        </Card>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <Card className="p-6 border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl text-center">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <p className="text-rose-700 dark:text-rose-400 font-medium text-sm">{error}</p>
        </Card>
      )}

      {/* Quick Stats Grid */}
      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Patients</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                    {data.quickStats.totalPatients}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/40 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Consultations</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                    {data.quickStats.totalAppointments}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Settled Revenue</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                    {formatINR(data.quickStats.totalRevenue)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950/40 rounded-xl flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Doctors</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {data.quickStats.activeDoctors}
                    </p>
                    <span className="text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded">
                      On-Duty
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Appointments Chart */}
            <Card className="p-6 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  Appointment Distribution by Day
                </h3>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.appointmentData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#1e293b', opacity: 0.1 }}
                      contentStyle={{ 
                        borderRadius: '12px', 
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        color: '#ffffff'
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#06b6d4" 
                      radius={[6, 6, 0, 0]} 
                      barSize={36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Department Distribution Chart */}
            <Card className="p-6 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Patients by Specialization
                </h3>
              </div>
              <div className="h-72 w-full">
                {data.departmentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.departmentData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        width={110}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '12px', 
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          color: '#ffffff'
                        }}
                      />
                      <Bar 
                        dataKey="patients" 
                        fill="#8b5cf6" 
                        radius={[0, 6, 6, 0]} 
                        barSize={24}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <BarChart3 className="w-10 h-10 text-slate-400 mb-2" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No Department Records Yet</p>
                    <p className="text-xs text-slate-500 mt-1">Specialization analytics will chart automatically as appointments are booked.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Zero traffic banner when freshly seeded */}
          {!hasConsultations && (
            <Card className="p-6 bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/60 dark:border-cyan-800/60 rounded-2xl text-center">
              <h4 className="font-bold text-slate-900 dark:text-white">Production Baseline Database Active</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-lg mx-auto leading-relaxed">
                Hospital infrastructure is cleanly initialized with 0 mock patient appointments. All chart distributions and revenue stats will update dynamically as real patient traffic is received.
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <Button
                  onClick={() => navigate("/admin/doctors")}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl shadow-sm text-xs px-4"
                >
                  Manage Doctors Roster
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/admin/patients")}
                  className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs px-4"
                >
                  Patient Directory
                </Button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
