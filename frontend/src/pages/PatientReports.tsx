import { FileText, Download, Eye, Calendar, TrendingUp, Activity } from "lucide-react";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";

const reports = [
  {
    id: 1,
    name: "Complete Blood Count (CBC)",
    date: "2024-02-20",
    doctor: "Dr. Aarav Mehta",
    type: "Lab Report",
    status: "normal",
    fileSize: "2.4 MB"
  },
  {
    id: 2,
    name: "Chest X-Ray",
    date: "2024-02-18",
    doctor: "Dr. Kavya Iyer",
    type: "Radiology",
    status: "normal",
    fileSize: "5.8 MB"
  },
  {
    id: 3,
    name: "Lipid Profile",
    date: "2024-02-15",
    doctor: "Dr. Meera Kapoor",
    type: "Lab Report",
    status: "attention",
    fileSize: "1.9 MB"
  },
  {
    id: 4,
    name: "ECG Report",
    date: "2024-02-10",
    doctor: "Dr. Rahul Bansal",
    type: "Cardiac",
    status: "normal",
    fileSize: "3.2 MB"
  },
  {
    id: 5,
    name: "Thyroid Function Test",
    date: "2024-02-05",
    doctor: "Dr. Nisha Menon",
    type: "Lab Report",
    status: "normal",
    fileSize: "2.1 MB"
  },
  {
    id: 6,
    name: "Ultrasound Abdomen",
    date: "2024-01-28",
    doctor: "Dr. Aarav Mehta",
    type: "Radiology",
    status: "normal",
    fileSize: "7.3 MB"
  },
];

const vitalTrends = [
  { label: "Blood Pressure", value: "120/80", status: "normal", trend: "stable" },
  { label: "Blood Sugar", value: "95 mg/dL", status: "normal", trend: "down" },
  { label: "Cholesterol", value: "195 mg/dL", status: "attention", trend: "up" },
  { label: "Heart Rate", value: "72 bpm", status: "normal", trend: "stable" },
];

export function PatientReports() {
  return (
    <div className="space-y-6">
      {/* Vital Trends */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {vitalTrends.map((vital, index) => (
          <Card key={index} className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{vital.label}</p>
              {vital.trend === "up" && <TrendingUp className="w-4 h-4 text-red-500" />}
              {vital.trend === "down" && <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />}
              {vital.trend === "stable" && <Activity className="w-4 h-4 text-gray-400" />}
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">{vital.value}</p>
            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
              vital.status === "normal" 
                ? "bg-green-50 text-green-700" 
                : "bg-amber-50 text-amber-700"
            }`}>
              {vital.status === "normal" ? "Normal" : "Needs Attention"}
            </span>
          </Card>
        ))}
      </div>

      {/* Reports List */}
      <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">All Reports</h3>
              <p className="text-sm text-gray-500">Your complete medical report history</p>
            </div>
            <Button variant="outline" className="rounded-xl">
              <FileText className="w-4 h-4 mr-2" />
              Request Report
            </Button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {reports.map((report) => (
            <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    report.type === "Lab Report" 
                      ? "bg-cyan-100" 
                      : report.type === "Radiology"
                      ? "bg-blue-100"
                      : "bg-purple-100"
                  }`}>
                    <FileText className={`w-6 h-6 ${
                      report.type === "Lab Report" 
                        ? "text-cyan-600" 
                        : report.type === "Radiology"
                        ? "text-blue-600"
                        : "text-purple-600"
                    }`} />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">{report.name}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(report.date).toLocaleDateString()}
                      </div>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{report.doctor}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{report.fileSize}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    report.status === "normal"
                      ? "bg-green-50 text-green-700"
                      : "bg-amber-50 text-amber-700"
                  }`}>
                    {report.type}
                  </span>
                  <Button variant="outline" size="sm" className="rounded-xl">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
