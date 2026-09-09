import { useState, useEffect } from "react";
import { Pill, Clock, AlertTriangle, Info, Lightbulb, ShieldAlert, Calendar, Plus, User } from "lucide-react";
import { Card } from "../components/common/Card";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { useSearch } from "../context/SearchContext";
import { useNavigate } from "react-router";
import { api } from "../services/ApiService";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

interface PrescriptionItem {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  reason: string;
  notes: string;
  status: string;
}

const avoidList = [
  "Alcohol consumption with active medications",
  "High-sodium processed meals for hypertension",
  "Excessive caffeine intake during treatment",
  "Over-the-counter NSAID painkillers without physician consultation",
];

const preventionTips = [
  "Take prescribed medications at the same time every day",
  "Never alter dosage or cease antibiotic regimens prematurely",
  "Keep an active medication log in case of adverse drug reactions",
  "Store medications in a cool, moisture-free environment away from sunlight",
];

export function PrescriptionInsight() {
  const navigate = useNavigate();
  const { searchQuery } = useSearch();
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const res = await api.get<{ success: boolean; prescriptions: PrescriptionItem[] }>("/user/prescriptions");
        if (isMounted && res?.prescriptions) {
          setPrescriptions(res.prescriptions);
        }
      } catch (err) {
        console.warn("Failed to load prescriptions:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPrescriptions();
    return () => {
      isMounted = false;
    };
  }, []);

  const q = searchQuery.toLowerCase().trim();

  const filteredPrescriptions = prescriptions.filter((item) => {
    if (!q) return true;
    return (
      item.doctor.toLowerCase().includes(q) ||
      item.specialty.toLowerCase().includes(q) ||
      item.reason.toLowerCase().includes(q) ||
      item.notes.toLowerCase().includes(q)
    );
  });

  const latestPrescription = filteredPrescriptions[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      {latestPrescription && (
        <Card className="p-6 border border-teal-500/30 shadow-sm bg-gradient-to-r from-teal-700 to-emerald-600 text-white rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <p className="text-teal-100 text-xs uppercase tracking-wider mb-1 font-semibold">Latest Attending Doctor</p>
              <h3 className="text-xl font-semibold mb-0.5">{latestPrescription.doctor}</h3>
              <p className="text-teal-100 text-xs">{latestPrescription.specialty} • MEDIrxCARE Hospital</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-teal-100 text-xs uppercase tracking-wider mb-1 font-semibold">Consultation Date</p>
              <p className="text-base sm:text-xl font-semibold">{new Date(latestPrescription.date).toLocaleDateString()}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Main Prescription Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Prescriptions & Clinical Notes</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Electronic prescription records from verified hospital visits</p>
          </div>
          <Button
            onClick={() => navigate("/dashboard/book-appointment")}
            className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Book Consultation
          </Button>
        </div>

        {loading ? (
          <div className="py-12">
            <LoadingSpinner />
          </div>
        ) : filteredPrescriptions.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredPrescriptions.map((prescription) => (
              <Card key={prescription.id} className="p-6 border border-slate-200/80 bg-white shadow-xs hover:border-teal-400/40 dark:bg-slate-900 dark:border-slate-800 rounded-2xl transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-teal-50 text-teal-700 border border-teal-200/60 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/60">
                    <Pill className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {prescription.status}
                  </Badge>
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-0.5">{prescription.doctor}</h4>
                <p className="text-xs text-teal-700 dark:text-teal-400 font-medium mb-3">{prescription.specialty}</p>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 mb-3">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Diagnosis / Visit Reason:</p>
                  <p>{prescription.reason}</p>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">Prescription Instructions:</p>
                  <p className="leading-relaxed bg-amber-50/70 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-200/50 dark:border-amber-900/40 text-amber-900 dark:text-amber-300">
                    {prescription.notes}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-slate-800 rounded-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200/50 dark:border-teal-900/50">
              <Pill className="h-7 w-7" />
            </div>
            <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">No active prescriptions found</h4>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              You do not have any electronic prescriptions registered on file. Consult with a specialist doctor to receive digital prescription charts and medication guidance.
            </p>
            <div className="mt-5">
              <Button
                onClick={() => navigate("/dashboard/book-appointment")}
                className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-xs px-5 h-10"
              >
                Book a Consultation
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Precautions & Tips */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-50">General Drug Interactions to Avoid</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            {avoidList.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-teal-600" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-50">Medication Safety Tips</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            {preventionTips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
