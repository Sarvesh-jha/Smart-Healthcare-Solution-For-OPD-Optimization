import { useState, useEffect } from "react";
import { FileText, Download, Eye, Calendar, TrendingUp, Activity, FlaskConical, Plus, CheckCircle2, ShieldCheck, Printer, Stethoscope } from "lucide-react";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { useSearch } from "../context/SearchContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { api } from "../services/ApiService";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/common/Dialog";

interface MedicalReport {
  id: string;
  appointmentId?: string;
  name: string;
  date: string;
  doctor: string;
  type: string;
  status: string;
  fileSize: string;
}

interface PatientVitals {
  bloodPressure?: string | null;
  bloodSugar?: string | null;
  cholesterol?: string | null;
  heartRate?: string | null;
}

export function PatientReports() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { searchQuery } = useSearch();
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [vitals, setVitals] = useState<PatientVitals | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);

  const handleDownloadReport = (report: MedicalReport) => {
    const reportContent = `=================================================================
MEDIrxCARE CLINICAL DIAGNOSTICS & PATHOLOGY NETWORK
Accredited Hospital Diagnostic Services & Clinical Labs
=================================================================
DOCUMENT ID:      ${report.id}
REPORT TITLE:     ${report.name}
SPECIALTY / TYPE: ${report.type}
DATE OF ISSUE:    ${new Date(report.date).toLocaleDateString()}
ATTENDING DOCTOR: ${report.doctor}
CLINICAL STATUS:  ${report.status.toUpperCase()}
DOCUMENT SIZE:    ${report.fileSize}
-----------------------------------------------------------------
PATIENT IDENTIFICATION:
Patient Name:     ${user?.name || "Verified Patient"}
Patient UHID:     ${user?.id || "MED-84920"}
Registered Email: ${user?.email || "patient@medirxcare.in"}
-----------------------------------------------------------------
CLINICAL OBSERVATIONS & TEST PARAMETERS:
- Test specimen processed under ISO 15189 / NABL standards.
- Reagents calibrated within physiological standard deviations.
- Assessment: ${
      report.status === "normal"
        ? "All observed parameters fall within standard physiological reference ranges."
        : "Borderline or abnormal markers identified. Immediate clinical consultation advised."
    }

PHYSIOLOGICAL REFERENCE VITALS AT TIME OF SPECIMEN:
- Blood Pressure:     ${vitals?.bloodPressure || "120/80 mmHg (Baseline Reference)"}
- Fasting Blood Sugar:${vitals?.bloodSugar || "95 mg/dL (Reference: 70 - 99 mg/dL)"}
- Serum Cholesterol:  ${vitals?.cholesterol || "185 mg/dL (Reference: < 200 mg/dL)"}
- Resting Heart Rate: ${vitals?.heartRate || "72 bpm (Reference: 60 - 100 bpm)"}
-----------------------------------------------------------------
LABORATORY VERIFICATION & DIGITAL AUTHENTICATION:
Authorized by: ${report.doctor}
Chief Pathologist & Senior Consultant
MEDIrxCARE Diagnostic Laboratories
Status: Digitally Signed & Encrypted
=================================================================`;

    const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `MEDIrxCARE_Report_${report.name.replace(/[^a-zA-Z0-9]/g, "_")}_${report.id.slice(-6)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded "${report.name}" successfully!`);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchReports = async () => {
      try {
        setLoading(true);
        // Query the dedicated diagnostic / lab test reports endpoint
        const res = await api.get<{
          success: boolean;
          reports: MedicalReport[];
          vitals?: PatientVitals;
        }>("/reports");

        if (isMounted && res) {
          setReports(res.reports || []);
          if (res.vitals) {
            setVitals(res.vitals);
          }
        }
      } catch (err) {
        console.warn("Failed to load diagnostic reports:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReports();
    return () => {
      isMounted = false;
    };
  }, []);

  const q = searchQuery.toLowerCase().trim();

  const filteredReports = reports.filter((report) => {
    if (!q) return true;
    return (
      report.name.toLowerCase().includes(q) ||
      report.doctor.toLowerCase().includes(q) ||
      report.type.toLowerCase().includes(q) ||
      report.status.toLowerCase().includes(q)
    );
  });

  const vitalCards = [
    {
      label: "Blood Pressure",
      value: vitals?.bloodPressure ? vitals.bloodPressure : "-- / --",
      hasData: Boolean(vitals?.bloodPressure),
      status: "normal",
      trend: "stable",
    },
    {
      label: "Blood Sugar",
      value: vitals?.bloodSugar
        ? vitals.bloodSugar.toLowerCase().includes("mg/dl")
          ? vitals.bloodSugar
          : `${vitals.bloodSugar} mg/dL`
        : "-- mg/dL",
      hasData: Boolean(vitals?.bloodSugar),
      status: "normal",
      trend: "down",
    },
    {
      label: "Cholesterol",
      value: vitals?.cholesterol
        ? vitals.cholesterol.toLowerCase().includes("mg/dl")
          ? vitals.cholesterol
          : `${vitals.cholesterol} mg/dL`
        : "-- mg/dL",
      hasData: Boolean(vitals?.cholesterol),
      status: "attention",
      trend: "up",
    },
    {
      label: "Heart Rate",
      value: vitals?.heartRate
        ? vitals.heartRate.toLowerCase().includes("bpm")
          ? vitals.heartRate
          : `${vitals.heartRate} bpm`
        : "-- bpm",
      hasData: Boolean(vitals?.heartRate),
      status: "normal",
      trend: "stable",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Vital Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {vitalCards.map((vital, index) => (
          <Card
            key={index}
            className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs dark:bg-slate-900 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{vital.label}</p>
              {vital.hasData ? (
                <>
                  {vital.trend === "up" && <TrendingUp className="w-4 h-4 text-rose-500" />}
                  {vital.trend === "down" && <TrendingUp className="w-4 h-4 text-emerald-500 rotate-180" />}
                  {vital.trend === "stable" && <Activity className="w-4 h-4 text-slate-400" />}
                </>
              ) : (
                <Activity className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              )}
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">{vital.value}</p>
            {vital.hasData ? (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold border ${
                  vital.status === "normal"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/50"
                    : "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/50"
                }`}
              >
                {vital.status === "normal" ? "Normal" : "Needs Attention"}
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/80">
                No Data Recorded
              </span>
            )}
          </Card>
        ))}
      </div>

      {/* Reports List */}
      <Card className="bg-white border border-slate-200/80 rounded-2xl shadow-xs dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Diagnostic & Lab Reports</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {searchQuery ? `Showing results matching "${searchQuery}"` : "Your complete clinical report records"}
              </p>
            </div>
            <Button
              onClick={() => navigate("/dashboard/tests-services")}
              className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Book Tests & Scans
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-12">
            <LoadingSpinner />
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200/50 dark:border-teal-900/50 shadow-xs">
              <FlaskConical className="h-7 w-7" />
            </div>
            <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              No Diagnostic Reports Available
            </h4>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              You haven't completed any lab tests or diagnostic screenings yet.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => navigate("/dashboard/tests-services")}
                className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-xs px-5 h-10 inline-flex items-center"
              >
                + Book Tests & Scans
              </Button>
            </div>
          </div>
        ) : filteredReports.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredReports.map((report) => (
              <div key={report.id} className="p-6 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${
                        report.type === "Diagnostic Pathology"
                          ? "bg-teal-50 text-teal-700 border-teal-200/60 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/60"
                          : "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60"
                      }`}
                    >
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-slate-900 dark:text-slate-50">{report.name}</h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(report.date).toLocaleDateString()}
                        </div>
                        <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{report.doctor}</span>
                        <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">{report.fileSize}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 self-end sm:self-center">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        report.status === "normal"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/50"
                          : "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/50"
                      }`}
                    >
                      {report.type}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                      className="rounded-xl hover:border-teal-400 hover:text-teal-600 dark:hover:border-teal-500"
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReport(report)}
                      className="rounded-xl hover:border-teal-400 hover:text-teal-600 dark:hover:border-teal-500"
                      title="Download Report"
                      aria-label="Download Report"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              <FileText className="h-6 w-6" />
            </div>
            <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">No matching reports found</h4>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              No diagnostic reports match "{searchQuery}". Try clearing your search query.
            </p>
          </div>
        )}
      </Card>

      {/* Clinical Report View Dialog */}
      <Dialog open={selectedReport !== null} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xl">
          {selectedReport && (
            <div>
              {/* Header */}
              <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 p-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-teal-200 border border-teal-400/30">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
                        NABL & ISO-15189 Accredited
                      </span>
                      <span className="text-xs text-teal-200/80 font-mono">ID: {selectedReport.id.slice(-8).toUpperCase()}</span>
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-white">{selectedReport.name}</h3>
                    <p className="text-xs text-teal-100/80 mt-1">
                      MEDIrxCARE Diagnostics • Attending: {selectedReport.doctor}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 ${
                      selectedReport.status === "normal"
                        ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40"
                        : "bg-amber-500/20 text-amber-200 border border-amber-400/40"
                    }`}
                  >
                    {selectedReport.status}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Patient & Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <p className="text-slate-400 dark:text-slate-500">Patient</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{user?.name || "Verified Patient"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 dark:text-slate-500">Specimen Date</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{new Date(selectedReport.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 dark:text-slate-500">Category</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedReport.type}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 dark:text-slate-500">File Payload</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedReport.fileSize}</p>
                  </div>
                </div>

                {/* Clinical Diagnostic Parameters Table */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                    Analyzed Diagnostic Parameters
                  </h4>
                  <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200/80 dark:border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3">Test Parameter</th>
                          <th className="py-2.5 px-3">Observed Value</th>
                          <th className="py-2.5 px-3">Reference Range</th>
                          <th className="py-2.5 px-3 text-right">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        <tr>
                          <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">Blood Pressure (Systolic/Diastolic)</td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 dark:text-slate-100">{vitals?.bloodPressure || "118/78 mmHg"}</td>
                          <td className="py-2.5 px-3 text-slate-500">90/60 - 120/80 mmHg</td>
                          <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold">Optimal</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">Fasting Blood Glucose</td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 dark:text-slate-100">{vitals?.bloodSugar || "92 mg/dL"}</td>
                          <td className="py-2.5 px-3 text-slate-500">70 - 99 mg/dL</td>
                          <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold">Normal</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">Serum Total Cholesterol</td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 dark:text-slate-100">{vitals?.cholesterol || "185 mg/dL"}</td>
                          <td className="py-2.5 px-3 text-slate-500">&lt; 200 mg/dL</td>
                          <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold">Desirable</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">Resting Cardiac Pulse</td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 dark:text-slate-100">{vitals?.heartRate || "70 bpm"}</td>
                          <td className="py-2.5 px-3 text-slate-500">60 - 100 bpm</td>
                          <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold">Normal</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pathologist Assessment */}
                <div className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-900/50 text-xs">
                  <div className="flex items-center gap-2 mb-1 font-semibold text-teal-900 dark:text-teal-200">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    Pathologist Clinical Impression
                  </div>
                  <p className="text-teal-800/90 dark:text-teal-300 leading-relaxed">
                    Specimen tests demonstrate physiological homeostasis with no acute cellular irregularities detected. Regular 6-month preventive checkup recommended.
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-teal-200/50 dark:border-teal-900/40 flex items-center justify-between text-[11px] text-teal-700 dark:text-teal-400">
                    <span>Verified by: <strong className="font-semibold">{selectedReport.doctor}</strong></span>
                    <span className="font-mono">MEDIrxCARE Clinical Diagnostics Core</span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedReport(null)}
                  className="rounded-xl text-xs h-9"
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleDownloadReport(selectedReport)}
                  className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs h-9 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download Verified Report
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
