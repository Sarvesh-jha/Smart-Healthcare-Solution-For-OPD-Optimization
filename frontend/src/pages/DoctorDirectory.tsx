import { useEffect, useState } from "react";
import { Star, Video, User as UserIcon, Calendar, MapPin } from "lucide-react";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { useNavigate } from "react-router";
import { DoctorService } from "../services/DoctorService";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { DoctorSearchLogo } from "../components/icons/DoctorSearchLogo";
import { formatINR } from "../utils/currency";
import { useSearch } from "../context/SearchContext";

const specializations = [
  "All",
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "General Physician",
  "Psychiatry",
];

export function DoctorDirectory() {
  const navigate = useNavigate();
  const { searchQuery } = useSearch();
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const data = await DoctorService.getAllDoctors();
        setDoctors(data);
      } catch (error) {
        console.error("Failed to load doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSpecialty = selectedSpecialty === "All" || doctor.specialty === selectedSpecialty;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      doctor.name.toLowerCase().includes(q) ||
      doctor.specialty.toLowerCase().includes(q) ||
      (doctor.bio && doctor.bio.toLowerCase().includes(q)) ||
      (doctor.location && doctor.location.toLowerCase().includes(q));
    return matchesSpecialty && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Specialty Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {specializations.map((specialty) => {
          const isActive = selectedSpecialty === specialty;
          return (
            <button
              key={specialty}
              onClick={() => setSelectedSpecialty(specialty)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? "bg-teal-600 text-white border border-teal-600 shadow-xs font-semibold"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {specialty}
            </button>
          );
        })}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <Card
              key={doctor.id}
              className="group border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-teal-500/40 hover:shadow-sm rounded-xl dark:bg-slate-900 dark:border-slate-800"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 border border-teal-200/60 text-base font-semibold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                    {doctor.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-base leading-snug">{doctor.name}</h3>
                    <p className="text-xs font-medium text-teal-700 dark:text-teal-400 mt-0.5">{doctor.specialty}</p>
                    <div className="mt-1.5 flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-50">{doctor.rating}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-400">({doctor.reviews} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                    <span>{doctor.experience} clinical experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{doctor.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>Next Available: <strong className="text-slate-800 dark:text-slate-200 font-medium">{doctor.nextAvailable}</strong></span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <div className="rounded-lg bg-slate-50 border border-slate-100 p-2.5 dark:bg-slate-800/60">
                    <div className="mb-0.5 flex items-center gap-1.5">
                      <Video className="h-3.5 w-3.5 text-teal-600" />
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Online</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{formatINR(doctor.onlineFee)}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-100 p-2.5 dark:bg-slate-800/60">
                    <div className="mb-0.5 flex items-center gap-1.5">
                      <UserIcon className="h-3.5 w-3.5 text-emerald-600" />
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">In-Person</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{formatINR(doctor.offlineFee)}</p>
                  </div>
                </div>

                <Button
                  className="w-full h-10 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-xs"
                  onClick={() => navigate("/dashboard/book-appointment", { state: { doctor } })}
                >
                  Book Appointment
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredDoctors.length === 0 && (
        <Card className="border border-slate-200/80 bg-white p-10 text-center shadow-xs rounded-xl dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No doctors match your current search or specialty filter.</p>
        </Card>
      )}
    </div>
  );
}
