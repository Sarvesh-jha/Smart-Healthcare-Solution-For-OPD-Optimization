import { StatusBar } from "expo-status-bar";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { api, Appointment, Doctor, User } from "./src/api";

export default function App() {
  const [session, setSession] = useState<{ token: string; user: User } | null>(
    null,
  );
  const [hydrating, setHydrating] = useState(true);
  useEffect(() => {
    SecureStore.getItemAsync("medirxcare.session")
      .then((stored) => {
        if (stored) setSession(JSON.parse(stored));
      })
      .catch(() => SecureStore.deleteItemAsync("medirxcare.session"))
      .finally(() => setHydrating(false));
  }, []);
  const authenticate = async (nextSession: { token: string; user: User }) => {
    await SecureStore.setItemAsync(
      "medirxcare.session",
      JSON.stringify(nextSession),
    );
    setSession(nextSession);
  };
  const logout = async () => {
    await SecureStore.deleteItemAsync("medirxcare.session");
    setSession(null);
  };
  if (hydrating)
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color="#0e7773" />
      </SafeAreaView>
    );
  return session ? (
    <PatientApp session={session} onLogout={logout} />
  ) : (
    <AuthScreen onAuthenticated={authenticate} />
  );
}

function Field({
  label,
  ...props
}: React.ComponentProps<typeof TextInput> & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={styles.input}
        placeholderTextColor="#8b9a9f"
      />
    </View>
  );
}

function AuthScreen({
  onAuthenticated,
}: {
  onAuthenticated: (session: { token: string; user: User }) => void;
}) {
  const [registering, setRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      const result = registering
        ? await api.register(name, email, password, phone)
        : await api.login(email, password);
      if (result.user.role !== "patient")
        throw new Error("This mobile app is for patient accounts.");
      onAuthenticated(result);
    } catch (error) {
      Alert.alert(
        "Unable to continue",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <SafeAreaView style={styles.auth}>
      <StatusBar style="light" />
      <View style={styles.authTop}>
        <Text style={styles.brand}>MEDIrxCARE</Text>
        <Text style={styles.authTitle}>
          {registering ? "Your care, in your hands." : "Welcome back."}
        </Text>
        <Text style={styles.authSub}>
          Appointments, guidance, and progress in one calm place.
        </Text>
      </View>
      <View style={styles.form}>
        {registering && (
          <Field
            label="Full name"
            value={name}
            onChangeText={setName}
            placeholder="Rohan Verma"
          />
        )}
        {registering && (
          <Field
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="+91 98765 43210"
            keyboardType="phone-pad"
          />
        )}
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 8 characters"
          secureTextEntry
        />
        <Pressable
          style={styles.primaryButton}
          onPress={submit}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>
              {registering ? "Create patient account" : "Sign in securely"}
            </Text>
          )}
        </Pressable>
        <Pressable onPress={() => setRegistering(!registering)}>
          <Text style={styles.switchText}>
            {registering
              ? "Already have an account? Sign in"
              : "New to MEDIrxCARE? Create an account"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function PatientApp({
  session,
  onLogout,
}: {
  session: { token: string; user: User };
  onLogout: () => void;
}) {
  const [tab, setTab] = useState("Home");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [queue, setQueue] = useState<any>(null);
  useEffect(() => {
    Promise.all([api.appointments(session.token), api.doctors()])
      .then(([nextAppointments, nextDoctors]) => {
        setAppointments(nextAppointments);
        setDoctors(nextDoctors);
      })
      .catch(() => {});
  }, [session.token]);
  const refreshQueue = () =>
    api
      .queue(session.token)
      .then(setQueue)
      .catch(() => setQueue(null));
  useEffect(() => {
    refreshQueue();
  }, [session.token]);
  const screen =
    tab === "Home" ? (
      <Home
        user={session.user}
        appointments={appointments}
        queue={queue}
        setTab={setTab}
      />
    ) : tab === "Doctors" ? (
      <Doctors
        doctors={doctors}
        token={session.token}
        onBooked={(appointment) => {
          setAppointments([appointment, ...appointments]);
          setTab("Home");
        }}
      />
    ) : tab === "Queue" ? (
      <Queue queue={queue} refresh={refreshQueue} />
    ) : tab === "Care Guide" ? (
      <CareGuide token={session.token} />
    ) : (
      <Profile user={session.user} onLogout={onLogout} />
    );
  return (
    <SafeAreaView style={styles.app}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>{screen}</ScrollView>
      <View style={styles.nav}>
        {["Home", "Doctors", "Queue", "Care Guide", "Profile"].map((item) => (
          <Pressable
            key={item}
            style={styles.navItem}
            onPress={() => setTab(item)}
          >
            <Text style={[styles.navIcon, tab === item && styles.navActive]}>
              {item === "Care Guide"
                ? "✦"
                : item === "Profile"
                  ? "○"
                  : item === "Doctors"
                    ? "＋"
                    : item === "Queue"
                      ? "≡"
                      : "⌂"}
            </Text>
            <Text style={[styles.navLabel, tab === item && styles.navActive]}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

function Header({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}
function Home({
  user,
  appointments,
  queue,
  setTab,
}: {
  user: User;
  appointments: Appointment[];
  queue: any;
  setTab: (tab: string) => void;
}) {
  const next = appointments[0];
  return (
    <>
      <View style={styles.homeHeader}>
        <View>
          <Text style={styles.eyebrow}>GOOD MORNING</Text>
          <Text style={styles.title}>
            {user.name.split(" ")[0]} <Text style={styles.wave}>✦</Text>
          </Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.avatar || "PT"}</Text>
        </View>
      </View>
      <View style={styles.hero}>
        <Text style={styles.heroKicker}>CARE THAT MOVES WITH YOU</Text>
        <Text style={styles.heroTitle}>Small steps. Better health.</Text>
        <Text style={styles.heroBody}>
          Keep your next visit, your questions, and your care plan close.
        </Text>
        <Pressable style={styles.heroButton} onPress={() => setTab("Doctors")}>
          <Text style={styles.heroButtonText}>Find a doctor ›</Text>
        </Pressable>
      </View>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Your next step</Text>
        <Pressable onPress={() => setTab("Doctors")}>
          <Text style={styles.link}>View all</Text>
        </Pressable>
      </View>
      {next ? (
        <AppointmentCard appointment={next} />
      ) : (
        <Empty
          title="No upcoming visits"
          text="Book a consultation when you are ready."
          action="Browse doctors"
          onPress={() => setTab("Doctors")}
        />
      )}
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Live queue</Text>
        <Pressable onPress={() => setTab("Queue")}>
          <Text style={styles.link}>Track ›</Text>
        </Pressable>
      </View>
      <View style={styles.queueMini}>
        <View>
          <Text style={styles.muted}>YOUR TOKEN</Text>
          <Text style={styles.token}>{queue?.patientToken || "--"}</Text>
        </View>
        <View>
          <Text style={styles.muted}>PEOPLE AHEAD</Text>
          <Text style={styles.metric}>{queue?.patientsAhead ?? "--"}</Text>
        </View>
        <View>
          <Text style={styles.muted}>EST. WAIT</Text>
          <Text style={styles.metric}>{queue?.estimatedWaitTime || "--"}</Text>
        </View>
      </View>
      <Text style={styles.sectionTitle}>Quick care</Text>
      <View style={styles.quickRow}>
        <QuickAction
          title="AI Care Guide"
          symbol="✦"
          onPress={() => setTab("Care Guide")}
        />
        <QuickAction
          title="Doctor directory"
          symbol="＋"
          onPress={() => setTab("Doctors")}
        />
      </View>
    </>
  );
}
function QuickAction({
  title,
  symbol,
  onPress,
}: {
  title: string;
  symbol: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.quick} onPress={onPress}>
      <Text style={styles.quickSymbol}>{symbol}</Text>
      <Text style={styles.quickText}>{title}</Text>
      <Text style={styles.quickArrow}>›</Text>
    </Pressable>
  );
}
function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardAccent}>
        <Text style={styles.cardDate}>{appointment.date}</Text>
        <Text style={styles.cardTime}>{appointment.time}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardDoctor}>{appointment.doctor}</Text>
        <Text style={styles.muted}>
          {appointment.specialty} · {appointment.type}
        </Text>
        <Text style={styles.status}>● {appointment.status}</Text>
      </View>
    </View>
  );
}

function Doctors({
  doctors,
  token,
  onBooked,
}: {
  doctors: Doctor[];
  token: string;
  onBooked: (appointment: Appointment) => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const visible = doctors.filter((doctor) =>
    `${doctor.name} ${doctor.specialization}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <>
      <Header eyebrow="Care team" title="Find your doctor" />
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search by name or specialty"
        placeholderTextColor="#8b9a9f"
        style={styles.search}
      />
      {visible.map((doctor) => (
        <View style={styles.doctorCard} key={doctor.id}>
          <View style={styles.doctorAvatar}>
            <Text style={styles.avatarText}>{doctor.avatar}</Text>
          </View>
          <View style={styles.doctorMain}>
            <Text style={styles.cardDoctor}>{doctor.name}</Text>
            <Text style={styles.doctorSpecialty}>{doctor.specialization}</Text>
            <Text style={styles.muted}>
              {doctor.experience} · ★ {doctor.rating}
            </Text>
            <Text style={styles.available}>Next: {doctor.nextAvailable}</Text>
          </View>
          <Pressable
            style={styles.smallButton}
            onPress={() => setSelectedDoctor(doctor)}
          >
            <Text style={styles.smallButtonText}>Book</Text>
          </Pressable>
        </View>
      ))}
      {selectedDoctor && (
        <BookingModal
          doctor={selectedDoctor}
          token={token}
          onClose={() => setSelectedDoctor(null)}
          onBooked={(appointment) => {
            setSelectedDoctor(null);
            onBooked(appointment);
          }}
        />
      )}
    </>
  );
}

function BookingModal({
  doctor,
  token,
  onClose,
  onBooked,
}: {
  doctor: Doctor;
  token: string;
  onClose: () => void;
  onBooked: (appointment: Appointment) => void;
}) {
  const [mode, setMode] = useState<"online" | "offline">("online");
  const [dayOffset, setDayOffset] = useState(1);
  const [slot, setSlot] = useState("10:30 AM");
  const [reason, setReason] = useState("General consultation");
  const [busy, setBusy] = useState(false);
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  const dateLabel = date.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const submit = async () => {
    setBusy(true);
    try {
      const result = await api.book(
        {
          doctorId: doctor.id,
          consultationType: mode,
          selectedDate: date.toISOString(),
          selectedSlot: slot,
          reason,
          paymentMethod: "upi",
        },
        token,
      );
      onBooked(result.appointment);
      Alert.alert(
        "Appointment confirmed",
        `Your ${mode} visit with ${doctor.name} is booked.`,
      );
    } catch (error) {
      Alert.alert(
        "Could not book",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalShade}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Book with {doctor.name}</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.close}>×</Text>
            </Pressable>
          </View>
          <Text style={styles.modalLabel}>CONSULTATION TYPE</Text>
          <View style={styles.choiceRow}>
            {(["online", "offline"] as const).map((item) => (
              <Pressable
                key={item}
                style={[styles.choice, mode === item && styles.choiceActive]}
                onPress={() => setMode(item)}
              >
                <Text
                  style={[
                    styles.choiceText,
                    mode === item && styles.choiceTextActive,
                  ]}
                >
                  {item === "online" ? "Video" : "In person"}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.modalLabel}>DATE</Text>
          <View style={styles.choiceRow}>
            {[1, 2, 3].map((offset) => {
              const item = new Date();
              item.setDate(item.getDate() + offset);
              return (
                <Pressable
                  key={offset}
                  style={[
                    styles.dateChoice,
                    dayOffset === offset && styles.choiceActive,
                  ]}
                  onPress={() => setDayOffset(offset)}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      dayOffset === offset && styles.choiceTextActive,
                    ]}
                  >
                    {item.toLocaleDateString("en-IN", { weekday: "short" })}
                  </Text>
                  <Text
                    style={[
                      styles.dateNumber,
                      dayOffset === offset && styles.choiceTextActive,
                    ]}
                  >
                    {item.getDate()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.selectedDate}>{dateLabel}</Text>
          <Text style={styles.modalLabel}>TIME</Text>
          <View style={styles.choiceRow}>
            {["10:30 AM", "2:00 PM", "4:30 PM"].map((item) => (
              <Pressable
                key={item}
                style={[styles.choice, slot === item && styles.choiceActive]}
                onPress={() => setSlot(item)}
              >
                <Text
                  style={[
                    styles.choiceText,
                    slot === item && styles.choiceTextActive,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Reason for visit"
            placeholderTextColor="#8b9a9f"
            style={styles.reasonInput}
          />
          <Pressable
            style={styles.primaryButton}
            onPress={submit}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>Confirm appointment</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function Queue({ queue, refresh }: { queue: any; refresh: () => void }) {
  return (
    <>
      <Header eyebrow="Stay in the loop" title="Live queue" />
      <View style={styles.queueHero}>
        <Text style={styles.queueKicker}>YOUR TOKEN</Text>
        <Text style={styles.bigToken}>{queue?.patientToken || "--"}</Text>
        <Text style={styles.queueDoctor}>
          {queue?.doctorName || "No offline appointment yet"}
        </Text>
      </View>
      <View style={styles.queueStats}>
        <View>
          <Text style={styles.muted}>AHEAD OF YOU</Text>
          <Text style={styles.bigMetric}>{queue?.patientsAhead ?? 0}</Text>
        </View>
        <View>
          <Text style={styles.muted}>ESTIMATED WAIT</Text>
          <Text style={styles.bigMetric}>
            {queue?.estimatedWaitTime || "0 mins"}
          </Text>
        </View>
      </View>
      <Text style={styles.bodyText}>
        We will keep this view updated as the clinic moves through today’s
        appointments.
      </Text>
      <Pressable style={styles.outlineButton} onPress={refresh}>
        <Text style={styles.outlineText}>Refresh queue</Text>
      </Pressable>
    </>
  );
}

function CareGuide({ token }: { token: string }) {
  const [issue, setIssue] = useState("");
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const ask = async () => {
    if (issue.trim().length < 3) return;
    setBusy(true);
    try {
      setResult(await api.careGuide(issue, token));
    } catch (error) {
      Alert.alert(
        "Care guide unavailable",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Header eyebrow="Thoughtful guidance" title="Care Guide" />
      <View style={styles.guideIntro}>
        <Text style={styles.guideIcon}>✦</Text>
        <Text style={styles.bodyText}>
          Tell us what you are feeling. We will help you understand what to do
          next.
        </Text>
      </View>
      <TextInput
        multiline
        value={issue}
        onChangeText={setIssue}
        placeholder="Example: I have had a headache since yesterday..."
        placeholderTextColor="#8b9a9f"
        style={styles.issueInput}
      />
      <Pressable style={styles.primaryButton} onPress={ask} disabled={busy}>
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryText}>Get guidance</Text>
        )}
      </Pressable>
      {result && (
        <View style={styles.result}>
          <Text style={styles.resultLabel}>
            {result.urgency || "PERSONALIZED GUIDANCE"}
          </Text>
          <Text style={styles.resultTitle}>
            {result.summary || "Here is a helpful next step"}
          </Text>
          <Text style={styles.bodyText}>
            {result.recommendation ||
              "Please consult a qualified healthcare professional for diagnosis and treatment."}
          </Text>
        </View>
      )}
    </>
  );
}

function Profile({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <>
      <Header eyebrow="Your space" title="Profile" />
      <View style={styles.profile}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>{user.avatar || "PT"}</Text>
        </View>
        <Text style={styles.profileName}>{user.name}</Text>
        <Text style={styles.muted}>{user.email}</Text>
      </View>
      <View style={styles.detail}>
        <Text style={styles.muted}>ACCOUNT TYPE</Text>
        <Text style={styles.detailValue}>Patient account</Text>
        <Text style={styles.muted}>PHONE</Text>
        <Text style={styles.detailValue}>{user.phone || "Not added"}</Text>
      </View>
      <Pressable style={styles.outlineButton} onPress={onLogout}>
        <Text style={styles.outlineText}>Sign out</Text>
      </Pressable>
    </>
  );
}
function Empty({
  title,
  text,
  action,
  onPress,
}: {
  title: string;
  text: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.bodyText}>{text}</Text>
      <Pressable onPress={onPress}>
        <Text style={styles.link}>{action} ›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7faf8",
  },
  app: { flex: 1, backgroundColor: "#f7faf8" },
  content: { padding: 22, paddingBottom: 40 },
  auth: { flex: 1, backgroundColor: "#0d3f3d" },
  authTop: { padding: 28, paddingTop: 72 },
  brand: {
    color: "#a9e6d1",
    fontWeight: "800",
    letterSpacing: 1.4,
    fontSize: 15,
  },
  authTitle: {
    color: "#fff",
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "800",
    marginTop: 46,
  },
  authSub: { color: "#c1d9d2", fontSize: 16, lineHeight: 24, marginTop: 14 },
  form: {
    backgroundColor: "#f7faf8",
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingTop: 30,
  },
  field: { marginBottom: 16 },
  label: {
    color: "#345451",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 7,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dce9e4",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    color: "#183a37",
  },
  primaryButton: {
    backgroundColor: "#0e7773",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  switchText: {
    textAlign: "center",
    color: "#0e7773",
    fontWeight: "700",
    marginTop: 22,
  },
  homeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },
  header: { marginBottom: 22, marginTop: 14 },
  eyebrow: {
    color: "#77908b",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  title: { color: "#173a36", fontSize: 31, fontWeight: "800", marginTop: 5 },
  wave: { color: "#e98b62" },
  avatar: {
    backgroundColor: "#d7eee4",
    height: 48,
    width: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#0e7773", fontWeight: "800" },
  hero: {
    backgroundColor: "#d7eee4",
    borderRadius: 18,
    padding: 22,
    marginBottom: 26,
  },
  heroKicker: {
    color: "#0e7773",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  heroTitle: {
    color: "#173a36",
    fontWeight: "800",
    fontSize: 25,
    marginTop: 11,
  },
  heroBody: {
    color: "#456b64",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 270,
  },
  heroButton: {
    alignSelf: "flex-start",
    backgroundColor: "#0e7773",
    borderRadius: 9,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginTop: 18,
  },
  heroButtonText: { color: "#fff", fontWeight: "800" },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 11,
    marginTop: 4,
  },
  sectionTitle: {
    color: "#173a36",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 18,
    marginBottom: 11,
  },
  link: { color: "#0e7773", fontWeight: "800" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e4efeb",
  },
  cardAccent: {
    backgroundColor: "#0e7773",
    padding: 16,
    width: 92,
    justifyContent: "center",
  },
  cardDate: { color: "#a9e6d1", fontSize: 12, fontWeight: "700" },
  cardTime: { color: "#fff", fontWeight: "800", fontSize: 16, marginTop: 5 },
  cardInfo: { padding: 16, flex: 1 },
  cardDoctor: { color: "#173a36", fontWeight: "800", fontSize: 16 },
  muted: { color: "#77908b", fontSize: 12, marginTop: 5 },
  status: {
    color: "#25846a",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 11,
    textTransform: "capitalize",
  },
  queueMini: {
    backgroundColor: "#fff1e9",
    borderRadius: 14,
    padding: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  token: { color: "#d66840", fontSize: 28, fontWeight: "800", marginTop: 3 },
  metric: { color: "#173a36", fontSize: 18, fontWeight: "800", marginTop: 8 },
  quickRow: { flexDirection: "row", gap: 10 },
  quick: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e4efeb",
    borderRadius: 13,
    padding: 14,
    flex: 1,
  },
  quickSymbol: { color: "#e98b62", fontSize: 21 },
  quickText: { color: "#173a36", fontWeight: "800", marginTop: 10 },
  quickArrow: {
    color: "#0e7773",
    fontSize: 22,
    position: "absolute",
    right: 12,
    bottom: 10,
  },
  nav: {
    height: 76,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e4efeb",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 10,
  },
  navItem: { alignItems: "center", width: 70 },
  navIcon: { color: "#92a9a3", fontSize: 20 },
  navLabel: { color: "#92a9a3", fontSize: 10, marginTop: 4, fontWeight: "700" },
  navActive: { color: "#0e7773" },
  search: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dce9e4",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#173a36",
    marginBottom: 14,
  },
  doctorCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 11,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e4efeb",
  },
  doctorAvatar: {
    height: 45,
    width: 45,
    borderRadius: 23,
    backgroundColor: "#d7eee4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  doctorMain: { flex: 1 },
  doctorSpecialty: {
    color: "#0e7773",
    fontWeight: "700",
    marginTop: 4,
    fontSize: 13,
  },
  available: {
    color: "#d66840",
    fontSize: 11,
    marginTop: 6,
    fontWeight: "700",
  },
  smallButton: {
    backgroundColor: "#0e7773",
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  smallButtonText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  queueHero: {
    backgroundColor: "#0d3f3d",
    borderRadius: 18,
    alignItems: "center",
    padding: 30,
  },
  queueKicker: {
    color: "#a9e6d1",
    fontSize: 11,
    letterSpacing: 1.3,
    fontWeight: "800",
  },
  bigToken: {
    color: "#fff",
    fontSize: 64,
    fontWeight: "800",
    marginVertical: 7,
  },
  queueDoctor: { color: "#c1d9d2", fontSize: 15 },
  queueStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    marginTop: 14,
  },
  bigMetric: {
    color: "#173a36",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 7,
  },
  bodyText: { color: "#58726c", fontSize: 15, lineHeight: 23 },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#0e7773",
    borderRadius: 11,
    padding: 15,
    alignItems: "center",
    marginTop: 24,
  },
  outlineText: { color: "#0e7773", fontWeight: "800" },
  guideIntro: {
    backgroundColor: "#fff1e9",
    borderRadius: 14,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  guideIcon: { color: "#d66840", fontSize: 26 },
  issueInput: {
    backgroundColor: "#fff",
    minHeight: 150,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dce9e4",
    padding: 16,
    fontSize: 15,
    color: "#173a36",
    textAlignVertical: "top",
    marginTop: 18,
  },
  result: {
    backgroundColor: "#d7eee4",
    borderRadius: 14,
    padding: 18,
    marginTop: 18,
  },
  resultLabel: {
    color: "#0e7773",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  resultTitle: {
    color: "#173a36",
    fontSize: 19,
    fontWeight: "800",
    marginVertical: 8,
  },
  profile: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
  },
  profileAvatar: {
    height: 74,
    width: 74,
    borderRadius: 37,
    backgroundColor: "#d7eee4",
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarText: { color: "#0e7773", fontSize: 24, fontWeight: "800" },
  profileName: {
    color: "#173a36",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 12,
  },
  detail: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginTop: 14,
  },
  detailValue: {
    color: "#173a36",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 5,
    marginBottom: 18,
  },
  empty: { backgroundColor: "#fff", padding: 20, borderRadius: 14 },
  emptyTitle: {
    color: "#173a36",
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 4,
  },
  modalShade: {
    flex: 1,
    backgroundColor: "rgba(13,63,61,.45)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#f7faf8",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  modalTitle: { color: "#173a36", fontSize: 20, fontWeight: "800", flex: 1 },
  close: { color: "#0e7773", fontSize: 32, lineHeight: 30 },
  modalLabel: {
    color: "#77908b",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 13,
    marginBottom: 8,
  },
  choiceRow: { flexDirection: "row", gap: 8 },
  choice: {
    borderWidth: 1,
    borderColor: "#cfe1da",
    borderRadius: 9,
    padding: 11,
    flex: 1,
    alignItems: "center",
  },
  choiceActive: { backgroundColor: "#0e7773", borderColor: "#0e7773" },
  choiceText: { color: "#355a54", fontWeight: "700", fontSize: 12 },
  choiceTextActive: { color: "#fff" },
  dateChoice: {
    borderWidth: 1,
    borderColor: "#cfe1da",
    borderRadius: 9,
    padding: 9,
    flex: 1,
    alignItems: "center",
  },
  dateNumber: {
    color: "#173a36",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 3,
  },
  selectedDate: { color: "#0e7773", fontWeight: "700", marginTop: 8 },
  reasonInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dce9e4",
    borderRadius: 10,
    padding: 13,
    color: "#173a36",
    marginTop: 16,
  },
});
