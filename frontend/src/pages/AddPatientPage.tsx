import { useState } from "react";
import { User, Mail, Phone, Calendar, Heart, Droplets, MapPin, ArrowLeft } from "lucide-react";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Label } from "../components/common/Label";
import { useNavigate } from "react-router";
import { PatientService } from "../services/PatientService";

export function AddPatientPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    bloodGroup: "",
    address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await PatientService.addPatient(formData);
      alert(`Successfully registered patient ${formData.name}. Temporary password: ${response.temporaryPassword}`);
      navigate("/admin/patients");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to add patient.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-full"
          onClick={() => navigate("/admin/patients")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Add New Patient</h1>
          <p className="text-sm text-gray-500 mt-1">Register a new patient to the system</p>
        </div>
      </div>

      <Card className="p-8 bg-white border border-gray-200 rounded-2xl shadow-md">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    id="name" 
                    name="name"
                    placeholder="e.g. Alex Morgan" 
                    className="pl-10 h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-cyan-500"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    id="email" 
                    name="email"
                    type="email"
                    placeholder="patient@example.com" 
                    className="pl-10 h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-cyan-500"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    id="phone" 
                    name="phone"
                    placeholder="e.g. +91 98765 43210" 
                    className="pl-10 h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-cyan-500"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="age" 
                      name="age"
                      type="number"
                      placeholder="e.g. 28" 
                      className="pl-10 h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-cyan-500"
                      value={formData.age}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select 
                    id="gender" 
                    name="gender"
                    className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Medical Information */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Medical Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <div className="relative">
                  <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select 
                    id="bloodGroup" 
                    name="bloodGroup"
                    className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Blood Group</option>
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>O+</option>
                    <option>O-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    id="address" 
                    name="address"
                    placeholder="e.g. 123 Healthcare Way, Bengaluru" 
                    className="pl-10 h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-cyan-500"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          </section>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 h-12 rounded-xl border-gray-300"
              onClick={() => navigate("/admin/patients")}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 text-white shadow-lg shadow-cyan-500/20 font-semibold"
            >
              {isSubmitting ? "Registering..." : "Register Patient"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
