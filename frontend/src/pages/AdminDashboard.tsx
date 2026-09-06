import { useState } from "react";
import { Users, Calendar, Activity, ShieldCheck, BarChart3, CreditCard, Settings, TrendingUp, UserPlus, CheckCircle, Mail, Briefcase, Plus } from "lucide-react";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Label } from "../components/common/Label";
import { useNavigate } from "react-router";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { StatCard } from "../components/dashboard/StatCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/common/Dialog";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { stats, loading } = useDashboardStats('admin');
  const [isDialogOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Doctor",
    department: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Successfully added ${formData.name} as a ${formData.role}`);
    setIsOpen(false);
    setFormData({ name: "", email: "", role: "Doctor", department: "" });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1.5">System Overview</h1>
          <p className="text-sm text-gray-600 font-medium">Monitoring hospital performance and resources</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-gray-200 shadow-sm font-medium">
            Export Report
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-700 hover:to-teal-600 text-white shadow-md font-medium">
                <Plus className="w-4 h-4 mr-2" />
                Add New Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900">Add New Staff</DialogTitle>
                <DialogDescription className="text-gray-500">
                  Fill in the details below to register a new medical or administrative staff member.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name</Label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="name" 
                      name="name"
                      placeholder="e.g. Dr. Meera Kapoor" 
                      className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-200 focus:border-cyan-500"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="email" 
                      name="email"
                      type="email"
                      placeholder="staff@medirxcare.in" 
                      className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-200 focus:border-cyan-500"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-semibold text-gray-700">Role</Label>
                    <select 
                      id="role" 
                      name="role"
                      className="w-full h-11 rounded-xl bg-gray-50 border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                      value={formData.role}
                      onChange={handleInputChange}
                    >
                      <option>Doctor</option>
                      <option>Nurse</option>
                      <option>Admin</option>
                      <option>Receptionist</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-semibold text-gray-700">Department</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        id="department" 
                        name="department"
                        placeholder="e.g. Cardiology" 
                        className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-200 focus:border-cyan-500"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter className="pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="h-11 rounded-xl border-gray-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="h-11 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-700 hover:to-teal-600 text-white shadow-lg shadow-cyan-500/20 px-8"
                  >
                    Add Staff Member
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-xl" />
          ))
        ) : (
          <>
            <StatCard 
              title="Total Patients" 
              value={stats?.totalPatients || 0} 
              icon={Users} 
              trend="+12% from last month"
            />
            <StatCard 
              title="Active Doctors" 
              value={stats?.activeDoctors || 0} 
              icon={ShieldCheck} 
              iconColor="text-teal-600"
              bgColor="bg-teal-100"
            />
            <StatCard 
              title="Pending Appointments" 
              value={stats?.pendingAppointments || 0} 
              icon={Calendar} 
              iconColor="text-orange-600"
              bgColor="bg-orange-100"
            />
            <StatCard 
              title="System Health" 
              value={stats?.systemHealth || "100%"} 
              icon={Activity} 
              iconColor="text-green-600"
              bgColor="bg-green-100"
            />
          </>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Analytics Summary */}
        <Card className="lg:col-span-2 p-6 border-0 shadow-md bg-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Hospital Analytics</h3>
            </div>
            <select className="text-sm border-gray-200 rounded-lg bg-gray-50 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/20">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>
          
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Analytics visualization placeholder</p>
            </div>
          </div>
        </Card>

        {/* Quick Management */}
        <Card className="p-6 border-0 shadow-md bg-white">
          <h3 className="text-lg font-semibold text-gray-900 mb-5">Quick Management</h3>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 h-12 border-gray-200 hover:bg-gray-50 font-medium"
              onClick={() => navigate("/admin/doctors")}
            >
              <ShieldCheck className="w-5 h-5 text-cyan-600" />
              <span>Verify New Doctors</span>
              <span className="ml-auto bg-cyan-100 text-cyan-700 text-[10px] px-2 py-0.5 rounded-full font-bold">5</span>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 h-12 border-gray-200 hover:bg-gray-50 font-medium"
              onClick={() => navigate("/admin/payments")}
            >
              <CreditCard className="w-5 h-5 text-teal-600" />
              <span>Review Payments</span>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 h-12 border-gray-200 hover:bg-gray-50 font-medium"
              onClick={() => navigate("/admin/queue-monitoring")}
            >
              <Activity className="w-5 h-5 text-orange-600" />
              <span>Queue Health</span>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 h-12 border-gray-200 hover:bg-gray-50 font-medium"
              onClick={() => navigate("/admin/settings")}
            >
              <Settings className="w-5 h-5 text-gray-600" />
              <span>System Settings</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card className="p-6 border-0 shadow-md bg-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Recent System Logs</h3>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((log) => (
            <div key={log} className="flex items-start gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">New doctor registration pending review</p>
                <p className="text-xs text-gray-500 mt-0.5">Dr. Alan Turing submitted credentials • 10 mins ago</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
