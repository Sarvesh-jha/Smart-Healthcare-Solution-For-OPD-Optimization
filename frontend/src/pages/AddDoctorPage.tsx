import { useState } from "react";
import { UserCheck, Mail, Phone, MapPin, Briefcase, Award, Clock, ArrowLeft } from "lucide-react";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Label } from "../components/common/Label";
import { useNavigate } from "react-router";
import { DoctorService } from "../services/DoctorService";

export function AddDoctorPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    location: "",
    availability: "",
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
      const response = await DoctorService.addDoctor(formData);
      alert(`Successfully registered ${formData.name}. Temporary password: ${response.temporaryPassword}`);
      navigate("/admin/doctors");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to add doctor.");
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
          onClick={() => navigate("/admin/doctors")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Add New Doctor</h1>
          <p className="text-sm text-gray-500 mt-1">Register a new medical professional to the platform</p>
        </div>
      </div>

      <Card className="p-8 bg-white border border-gray-200 rounded-2xl shadow-md">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    id="name" 
                    name="name"
                    placeholder="e.g. Dr. Jane Smith" 
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
                    placeholder="doctor@medirxcare.in" 
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
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select 
                    id="specialization" 
                    name="specialization"
                    className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Specialization</option>
                    <option>Cardiology</option>
                    <option>Neurology</option>
                    <option>Orthopedics</option>
                    <option>Pediatrics</option>
                    <option>Dermatology</option>
                    <option>General Physician</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Professional Details */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Professional Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    id="experience" 
                    name="experience"
                    placeholder="e.g. 8 years" 
                    className="pl-10 h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-cyan-500"
                    value={formData.experience}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Hospital Location/Room</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    id="location" 
                    name="location"
                    placeholder="e.g. OPD Wing B, Suite 201" 
                    className="pl-10 h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-cyan-500"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="availability">Availability Schedule</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    id="availability" 
                    name="availability"
                    placeholder="e.g. Mon-Fri, 9:00 AM - 5:00 PM" 
                    className="pl-10 h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-cyan-500"
                    value={formData.availability}
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
              onClick={() => navigate("/admin/doctors")}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 text-white shadow-lg shadow-cyan-500/20 font-semibold"
            >
              {isSubmitting ? "Registering..." : "Register Doctor"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
