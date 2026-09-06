export const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5001/api";

export type User = { id: string; name: string; email: string; role: "patient" | "doctor" | "admin"; phone?: string; avatar?: string };
export type Doctor = { id: string; name: string; specialization: string; experience: string; location: string; avatar: string; rating: number; reviews: number; onlineFee: number; offlineFee: number; nextAvailable: string };
export type Appointment = { id: string; doctor: string; specialty: string; date: string; time: string; dateTime: string | null; type: string; status: string; reason: string; fee: number };

export async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong");
  return data as T;
}

export const api = {
  login: (email: string, password: string) => request<{ token: string; user: User }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (name: string, email: string, password: string, phone: string) => request<{ token: string; user: User }>("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password, phone, role: "patient" }) }),
  doctors: (search = "") => request<Doctor[]>(`/doctors${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  appointments: (token: string) => request<Appointment[]>("/appointments/upcoming", {}, token),
  dashboard: (token: string) => request<{ notifications: { id: string; message: string; time: string }[] }>("/dashboard/patient", {}, token),
  queue: (token: string) => request<{ patientToken: number | null; patientsAhead: number; estimatedWaitTime: string; doctorName: string; patientStatus: string | null }>("/queue/status", {}, token),
  careGuide: (issue: string, token: string) => request<{ summary?: string; recommendation?: string; urgency?: string }>("/ai/doctor", { method: "POST", body: JSON.stringify({ issue }) }, token),
  book: (payload: object, token: string) => request<{ appointment: Appointment }>("/appointments", { method: "POST", body: JSON.stringify(payload) }, token),
};
