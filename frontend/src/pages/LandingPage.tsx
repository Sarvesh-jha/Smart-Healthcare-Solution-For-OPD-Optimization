import { useState } from "react";
import { Mail, Lock, User, Phone, Shield, Zap, Clock, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Label } from "../components/common/Label";
import { Card } from "../components/common/Card";
import { SmartImage } from "../utils/SmartImage";
import { PulseLogo } from "../components/layout/PulseLogo";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/ApiService";
import { APP_NAME, APP_TAGLINE } from "../utils/brand";

export function LandingPage() {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [userRole, setUserRole] = useState<"patient" | "doctor" | "admin">("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSelectRole = (role: "patient" | "doctor" | "admin") => {
    setUserRole(role);
    setError("");
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    if (!isLogin && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = isLogin
        ? await api.post<{ token: string; user: any }>("/auth/login", {
            email,
            password,
          })
        : await api.post<{ token: string; user: any }>("/auth/register", {
            name,
            email,
            phone,
            password,
            role: userRole,
          });

      login(payload.token, payload.user);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to continue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/30 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-200 rounded-full opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-200 rounded-full opacity-10 blur-3xl" />
      </div>

      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-20 items-center relative z-10">
        {/* Left Side - Hero Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-white shadow-lg ring-1 ring-slate-200">
              <PulseLogo className="h-11 w-11" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{APP_NAME}</h1>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">{APP_TAGLINE}</p>
            </div>
          </div>

          <div className="space-y-5">
            <h2 className="text-5xl lg:text-6xl font-semibold text-gray-900 leading-tight">
              Your Health,<br />
              <span className="text-gray-700">Thoughtfully Connected</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
              Manage appointments, consultations, health records, and guided care follow-ups in one polished healthcare workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
              <Shield className="w-4 h-4 text-cyan-600" />
              <span className="text-sm font-medium text-gray-700">Secure & Private</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
              <Zap className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-medium text-gray-700">AI Powered</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">24/7 Care</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-6">
            <div className="text-center">
              <p className="text-4xl font-semibold text-gray-800 mb-1">10K+</p>
              <p className="text-sm text-gray-600">Active Patients</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-semibold text-gray-800 mb-1">500+</p>
              <p className="text-sm text-gray-600">Expert Doctors</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-semibold text-gray-800 mb-1">98%</p>
              <p className="text-sm text-gray-600">Satisfaction</p>
            </div>
          </div>

          <div className="hidden lg:block pt-8">
            <SmartImage
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
              alt="Healthcare illustration"
              className="w-full h-80 object-cover rounded-2xl shadow-xl"
            />
          </div>
        </div>

        {/* Right Side - Auth Card */}
        <Card className="p-8 shadow-xl border border-gray-100 bg-white">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-semibold text-gray-900">
                {isLogin ? "Welcome Back" : "Get Started"}
              </h3>
              <p className="text-gray-600">
                {isLogin 
                  ? "Sign in to access your health dashboard" 
                  : "Create your account to begin your health journey"}
              </p>
            </div>

            {/* Role Selection */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => handleSelectRole("patient")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  userRole === "patient"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => handleSelectRole("doctor")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  userRole === "doctor"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Doctor
              </button>
              <button
                type="button"
                onClick={() => handleSelectRole("admin")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  userRole === "admin"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Admin
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 text-sm font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input 
                      id="name" 
                      placeholder="e.g. Alex Morgan" 
                      className="pl-12 h-12 rounded-xl bg-gray-50/80 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500 transition-all text-gray-900 placeholder:text-gray-400"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 text-sm font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@company.com" 
                    className="pl-12 h-12 rounded-xl bg-gray-50/80 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500 transition-all text-gray-900 placeholder:text-gray-400 font-normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700 text-sm font-medium">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="e.g. +91 98765 43210" 
                      className="pl-12 h-12 rounded-xl bg-gray-50/80 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500 transition-all text-gray-900 placeholder:text-gray-400"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder={isLogin ? "Enter your password" : "Create password (min. 8 characters)"} 
                    className="pl-12 pr-12 h-12 rounded-xl bg-gray-50/80 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500 transition-all text-gray-900 placeholder:text-gray-400 font-normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 focus:outline-none transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between text-sm pt-1">
                  <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                    <input type="checkbox" className="rounded w-4 h-4 text-cyan-600 focus:ring-cyan-500" />
                    Remember me
                  </label>
                  <button type="button" className="text-cyan-600 hover:text-cyan-700 font-medium">
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-700 hover:to-teal-600 text-white font-medium shadow-sm transition-all"
              >
                {isSubmitting ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={toggleAuthMode}
                className="text-cyan-600 hover:text-cyan-700 font-semibold"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
