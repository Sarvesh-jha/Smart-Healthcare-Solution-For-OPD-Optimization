import { useState, useEffect } from "react";
import { Users, Search, FileText, Calendar, Clock, ChevronRight, X, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { Card } from "../components/common/Card";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { appointmentService } from "../services/AppointmentService";

interface PatientRecord {
  id: string;
  patientId: string;
  name: string;
  lastVisit: string;
  diagnosis: string;
  visits: number;
  history: Array<{
    id: string;
    date: string;
    time: string;
    reason: string;
    status: string;
    mode: string;
  }>;
}

export function DoctorPatientHistory() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [patientRecords, setPatientRecords] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchHistory() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await appointmentService.getDoctorAppointments({ view: "all" });

        if (!isMounted) return;

        // Group appointments by patient
        const patientMap = new Map<string, PatientRecord>();

        (data || []).forEach((appt: any) => {
          const pId = appt.patientId || appt.patient || "unknown";
          const pName = appt.patientName || appt.patient || "Patient";

          if (!patientMap.has(pId)) {
            patientMap.set(pId, {
              id: pId,
              patientId: pId,
              name: pName,
              lastVisit: appt.date || "Recent",
              diagnosis: appt.reason || "General Consultation",
              visits: 0,
              history: [],
            });
          }

          const existing = patientMap.get(pId)!;
          existing.visits += 1;
          existing.history.push({
            id: appt.id || appt._id,
            date: appt.date || "N/A",
            time: appt.time || appt.timeSlot || "N/A",
            reason: appt.reason || "General consultation",
            status: appt.status || "confirmed",
            mode: appt.mode || appt.type || "In-Person",
          });
        });

        const records = Array.from(patientMap.values());
        setPatientRecords(records);
      } catch (err: any) {
        console.error("Failed to load patient history:", err);
        if (isMounted) {
          setError(err.message || "Unable to fetch patient records from server.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPatients = patientRecords.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Patient History</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Access patient records and consultation history from live appointments</p>
        </div>
        <Button
          onClick={() => navigate("/doctor/schedule")}
          className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl shadow-sm text-sm"
        >
          <Calendar className="w-4 h-4 mr-2" />
          View Roster & Schedule
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/80 rounded-2xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient name or diagnosis..."
            className="pl-12 h-11 rounded-xl bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500"
          />
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-12 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-center rounded-2xl">
          <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400 text-sm">Loading patient records...</p>
        </Card>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <Card className="p-6 border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl text-center">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <p className="text-rose-700 dark:text-rose-400 font-medium text-sm">{error}</p>
        </Card>
      )}

      {/* Patient Records List */}
      {!isLoading && !error && (
        <Card className="p-6 border border-slate-200/80 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900/80 rounded-2xl">
          {filteredPatients.length > 0 ? (
            <div className="space-y-3">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 hover:border-cyan-500/40 transition-all gap-4"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-11 h-11 bg-gradient-to-br from-cyan-600 to-teal-500 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-sm shrink-0">
                      {patient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{patient.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        Latest: {patient.diagnosis}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    <div className="text-sm">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Last Visit</p>
                      <p className="font-medium text-slate-900 dark:text-slate-200">{patient.lastVisit}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Total Visits</p>
                      <p className="font-medium text-slate-900 dark:text-slate-200">{patient.visits}</p>
                    </div>
                    <div className="text-sm min-w-[140px] hidden md:block">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Diagnosis</p>
                      <p className="font-medium text-slate-900 dark:text-slate-200 truncate">{patient.diagnosis}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPatient(patient)}
                      className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 h-9 px-4 rounded-xl shrink-0"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Records
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : patientRecords.length === 0 ? (
            /* High-Contrast Clean Empty State */
            <div className="text-center py-12 px-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200/60 dark:border-cyan-800/60 flex items-center justify-center mx-auto mb-4 text-cyan-600 dark:text-cyan-400">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Patient Records Yet</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
                When patients book appointments or complete consultations with you, their medical visit summaries and records will automatically appear here.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button
                  onClick={() => navigate("/doctor/schedule")}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl shadow-sm px-5 text-sm"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Check Schedule & Queue
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">No matching patient records found</p>
              <p className="text-xs text-slate-500 mt-1">Try searching with a different name or diagnosis</p>
            </div>
          )}
        </Card>
      )}

      {/* Patient Record Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold text-sm">
                  {selectedPatient.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedPatient.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Consultations: {selectedPatient.visits}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 max-h-96 overflow-y-auto pr-1">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Consultation History</h4>
              {selectedPatient.history.map((record, index) => (
                <div
                  key={record.id || index}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{record.reason}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {record.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {record.time}
                      </span>
                      <span className="capitalize px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-medium">
                        {record.mode}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                      record.status === "completed"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                    }`}
                  >
                    {record.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedPatient(null)}
                className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
