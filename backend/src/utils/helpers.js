export function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export function formatDateLabel(date) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatTimeLabel(date) {
  const formatted = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  return formatted.replace(/\s*(am|pm)/i, (match) => ` ${match.trim().toUpperCase()}`).trim();
}

export function formatRelativeTime(date) {
  const now = Date.now();
  const diffMs = now - new Date(date).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

export function createAppointmentDateTime(dateValue, timeLabel) {
  const date = new Date(dateValue);
  const [time, meridiem] = timeLabel.trim().split(" ");
  const [rawHours, minutes] = time.split(":").map(Number);
  let hours = rawHours;

  if (meridiem.toUpperCase() === "PM" && hours !== 12) {
    hours += 12;
  }

  if (meridiem.toUpperCase() === "AM" && hours === 12) {
    hours = 0;
  }

  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || "",
    avatar: user.avatar || getInitials(user.name),
    status: user.status,
  };
}

export function serializeDoctor(user) {
  const onlineFee = Math.min(user.doctorProfile?.onlineFee || 499, 499);
  const offlineFee = Math.min(user.doctorProfile?.offlineFee || 799, 799);

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    specialization: user.doctorProfile?.specialization || "General Physician",
    specialty: user.doctorProfile?.specialization || "General Physician",
    experience: `${user.doctorProfile?.experienceYears || 0} years`,
    patients: user.doctorProfile?.patientsCount || 0,
    status: user.status,
    location: user.doctorProfile?.location || "Main Campus",
    avatar: user.avatar || getInitials(user.name),
    availability: user.doctorProfile?.availability || "Mon-Sat, 10:00 AM - 6:00 PM",
    rating: user.doctorProfile?.rating || 4.8,
    reviews: user.doctorProfile?.reviews || 0,
    onlineFee,
    offlineFee,
    nextAvailable: user.doctorProfile?.nextAvailable || "Today, 4:30 PM",
    bio: user.doctorProfile?.bio || "",
  };
}

export function serializePatient(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    age: user.patientProfile?.age || 0,
    gender: user.patientProfile?.gender || "Unknown",
    bloodGroup: user.patientProfile?.bloodGroup || "Unknown",
    lastVisit: user.patientProfile?.lastVisit || user.createdAt,
    totalVisits: user.patientProfile?.totalVisits || 0,
    status: user.status,
    avatar: user.avatar || getInitials(user.name),
    address: user.patientProfile?.address || "",
  };
}

export function serializeAppointment(appointment) {
  const doctorId = appointment.doctor?._id?.toString() || (typeof appointment.doctor === "string" ? appointment.doctor : appointment.doctor?.toString?.() || "");
  const patientId = appointment.patient?._id?.toString() || (typeof appointment.patient === "string" ? appointment.patient : appointment.patient?.toString?.() || "");
  const patientName = appointment.patient?.name || (typeof appointment.patient === "string" ? "" : "");
  const doctorName = appointment.doctor?.name || (typeof appointment.doctor === "string" ? "" : "");

  return {
    id: appointment._id.toString(),
    _id: appointment._id.toString(),
    doctor: doctorName,
    doctorId,
    patient: patientName,
    patientId,
    patientName,
    specialty: appointment.doctor?.doctorProfile?.specialization || "General Physician",
    date: formatDateLabel(appointment.dateTime),
    dateISO: appointment.dateTime?.toISOString?.() ? appointment.dateTime.toISOString().split("T")[0] : null,
    time: formatTimeLabel(appointment.dateTime),
    timeSlot: formatTimeLabel(appointment.dateTime),
    dateTime: appointment.dateTime?.toISOString?.() || null,
    type: appointment.type === "online" ? "Video Consultation" : "In-Person",
    mode: appointment.type === "online" ? "Video" : "In-Person",
    status: appointment.status,
    reason: appointment.reason,
    fee: appointment.fee || 0,
    paymentMethod: appointment.paymentMethod || "upi",
  };
}
