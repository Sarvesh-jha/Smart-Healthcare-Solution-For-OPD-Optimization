import { Pill, Clock, AlertTriangle, Info, Lightbulb, ShieldAlert } from "lucide-react";
import { Card } from "../components/common/Card";
import { Badge } from "../components/common/Badge";

const medicines = [
  {
    id: 1,
    name: "Aspirin",
    dosage: "100mg",
    frequency: "Once daily",
    duration: "30 days",
    timing: "After breakfast",
    instructions: "Take with food",
    color: "blue"
  },
  {
    id: 2,
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    duration: "60 days",
    timing: "After meals",
    instructions: "Do not skip doses",
    color: "green"
  },
  {
    id: 3,
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    duration: "90 days",
    timing: "Morning",
    instructions: "Take at same time daily",
    color: "purple"
  }
];

const dosageSchedule = [
  { time: "08:00 AM", medicines: ["Aspirin 100mg", "Lisinopril 10mg"], meal: "After Breakfast" },
  { time: "01:00 PM", medicines: ["Metformin 500mg"], meal: "After Lunch" },
  { time: "08:00 PM", medicines: ["Metformin 500mg"], meal: "After Dinner" }
];

const sideEffects = [
  { medicine: "Aspirin", effects: ["Nausea", "Upset stomach", "Heartburn"], severity: "Mild" },
  { medicine: "Metformin", effects: ["Diarrhea", "Nausea", "Stomach pain"], severity: "Common" },
  { medicine: "Lisinopril", effects: ["Dizziness", "Headache", "Dry cough"], severity: "Moderate" }
];

const avoidList = [
  "Alcohol consumption",
  "Grapefruit juice",
  "High-sodium foods",
  "Excessive caffeine",
  "Over-the-counter pain relievers without consultation"
];

const preventionTips = [
  "Take medications at the same time every day",
  "Keep a medication diary or use reminder apps",
  "Store medicines in a cool, dry place",
  "Never share your medications with others",
  "Complete the full course even if you feel better",
  "Report any unusual symptoms to your doctor immediately"
];

export function PrescriptionInsight() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Prescription Details */}
      <Card className="p-6 border-0 shadow-sm bg-gradient-to-r from-cyan-600 to-teal-500 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-cyan-50 mb-1">Prescribed by</p>
            <h3 className="text-xl font-semibold mb-1">Dr. Aarav Mehta</h3>
            <p className="text-cyan-50">Cardiologist</p>
          </div>
          <div className="text-right">
            <p className="text-cyan-50 mb-1">Prescription Date</p>
            <p className="text-xl font-semibold">Feb 20, 2026</p>
          </div>
        </div>
      </Card>

      {/* Medicine Cards */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Your Medications</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {medicines.map((medicine) => (
            <Card key={medicine.id} className="p-6 border-0 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-${medicine.color}-100 rounded-xl flex items-center justify-center`}>
                  <Pill className={`w-6 h-6 text-${medicine.color}-600`} />
                </div>
                <Badge variant="outline" className="text-xs">
                  {medicine.duration}
                </Badge>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">{medicine.name}</h4>
              <p className="text-2xl font-bold text-gray-900 mb-3">{medicine.dosage}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{medicine.frequency}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Info className="w-4 h-4" />
                  <span>{medicine.timing}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-600">{medicine.instructions}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Dosage Schedule */}
      <Card className="p-6 border-0 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Daily Dosage Schedule</h3>
        </div>
        <div className="space-y-4">
          {dosageSchedule.map((schedule, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="text-center min-w-[80px]">
                <p className="font-semibold text-gray-900">{schedule.time}</p>
                <p className="text-xs text-gray-600">{schedule.meal}</p>
              </div>
              <div className="flex-1 space-y-2">
                {schedule.medicines.map((med, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-600 rounded-full" />
                    <p className="text-sm text-gray-900">{med}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Side Effects */}
        <Card className="p-6 border-0 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Possible Side Effects</h3>
          </div>
          <div className="space-y-4">
            {sideEffects.map((item, index) => (
              <div key={index} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">{item.medicine}</p>
                  <Badge variant="outline" className="text-xs">
                    {item.severity}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.effects.map((effect, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded-lg">
                      {effect}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-4 pt-4 border-t border-gray-100">
            Contact your doctor immediately if you experience severe or persistent side effects.
          </p>
        </Card>

        {/* What to Avoid */}
        <Card className="p-6 border-0 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900">What to Avoid</h3>
          </div>
          <div className="space-y-3">
            {avoidList.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
                <div className="w-2 h-2 bg-red-600 rounded-full mt-1.5 flex-shrink-0" />
                <p className="text-sm text-gray-900">{item}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Prevention Tips */}
      <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-green-50 to-teal-50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900">Medication Tips & Best Practices</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {preventionTips.map((tip, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-xl">
              <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-green-700">{index + 1}</span>
              </div>
              <p className="text-sm text-gray-900">{tip}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
