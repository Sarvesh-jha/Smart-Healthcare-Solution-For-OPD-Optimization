import { useState, useRef, useEffect } from "react";
import {
  AlertTriangle,
  Calendar,
  ClipboardPlus,
  Pill,
  RotateCcw,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  User,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { api } from "../services/ApiService";
import { CareAssistantLogo } from "../components/icons/CareAssistantLogo";
import { DoctorSearchLogo } from "../components/icons/DoctorSearchLogo";
import { AI_CARE_GUIDE_NAME } from "../utils/brand";

interface Message {
  id: number;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface MedicineSuggestion {
  name: string;
  purpose: string;
  caution: string;
}

interface AiDoctorResult {
  summary: string;
  specialist: string;
  response: string;
  medicines: MedicineSuggestion[];
  selfCare: string[];
  urgentWarning: string;
}

const initialMessages: Message[] = [
  {
    id: 1,
    type: "ai",
    content:
      "Hello! I am your clinical care assistant. Describe your symptoms in plain language, mentioning duration, severity, and any factors that make them better or worse.",
    timestamp: new Date(),
  },
];

const samplePrompts = [
  "Persistent dry cough for 4 days with low-grade fever",
  "Severe throbbing headache on right side with nausea",
  "Lower back stiffness and sharp pain radiating down leg",
  "Burning epigastric chest sensation after spicy meals",
];

export function AiSymptomChecker() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<AiDoctorResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeMobileTab, setActiveMobileTab] = useState<"chat" | "plan">("chat");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const submitIssue = async (rawIssue: string) => {
    const trimmedInput = rawIssue.trim();

    if (!trimmedInput || isLoading) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        type: "user",
        content: trimmedInput,
        timestamp: new Date(),
      },
    ]);
    setInput("");
    setIsLoading(true);
    setError("");

    try {
      const nextResult = await api.post<AiDoctorResult>("/ai/doctor", {
        issue: trimmedInput,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          type: "ai",
          content: nextResult.response,
          timestamp: new Date(),
        },
      ]);
      setResult(nextResult);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to get care guidance.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages(initialMessages);
    setResult(null);
    setInput("");
    setError("");
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden gap-3">
      {/* Emergency Triage Notice (shrink-0) */}
      <div className="shrink-0 rounded-xl border border-rose-200/90 bg-rose-50/80 px-3.5 py-2 text-xs shadow-2xs dark:border-rose-950/60 dark:bg-rose-950/20">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <div className="text-[11px] sm:text-xs leading-relaxed text-rose-800 dark:text-rose-300">
            <strong className="font-semibold text-rose-900 dark:text-rose-200">Clinical Emergency Warning: </strong>
            If experiencing acute chest pain, severe shortness of breath, sudden neurological deficits, or loss of consciousness, trigger the <strong>SOS Emergency Hotline</strong> or visit the nearest emergency room immediately.
          </div>
        </div>
      </div>

      {/* Mobile Tab Switcher (Visible only on < lg screens) */}
      <div className="shrink-0 flex lg:hidden items-center gap-2 border-b border-slate-200/80 pb-2 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveMobileTab("chat")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeMobileTab === "chat"
              ? "bg-teal-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          Care Chat
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab("plan")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors relative ${
            activeMobileTab === "plan"
              ? "bg-teal-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          Care Plan
          {result && (
            <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-teal-300 align-middle" />
          )}
        </button>
      </div>

      {/* Main Viewport Content Split: Chat Stream + Care Plan Panel */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3.5 overflow-hidden">
        {/* Left Side: Full-Height Chat Interface */}
        <div
          className={`flex-1 min-h-0 flex flex-col rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 shadow-xs overflow-hidden ${
            activeMobileTab === "chat" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Chat Header (shrink-0) */}
          <div className="shrink-0 border-b border-slate-200/80 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-teal-500 text-white shadow-xs shadow-cyan-500/20">
                  <CareAssistantLogo className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{AI_CARE_GUIDE_NAME}</p>
                    <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-700 border border-teal-200/60 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800">
                      Triage Assistant
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Structured clinical triage with evidence-based next steps</p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8 px-2.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                title="Reset session"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Reset
              </Button>
            </div>
          </div>

          {/* Scrollable Message Body (flex-1 overflow-y-auto min-h-0) */}
          <div className="flex-1 overflow-y-auto min-h-0 space-y-4 p-4 sm:p-5 bg-[linear-gradient(180deg,_#f8fbfd_0%,_#ffffff_30%,_#f8fbfd_100%)] dark:bg-slate-950 scroll-smooth">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.type === "ai" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-teal-500 text-white shadow-xs">
                    <CareAssistantLogo className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[84%] sm:max-w-[78%] rounded-2xl p-3.5 sm:p-4 ${
                    message.type === "user"
                      ? "rounded-br-xs bg-teal-600 text-white shadow-2xs"
                      : "rounded-bl-xs border border-slate-200/80 bg-white text-slate-900 shadow-2xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  }`}
                >
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                  <span
                    className={`mt-1.5 block text-[10px] ${
                      message.type === "user" ? "text-teal-100" : "text-slate-400"
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {message.type === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-white shadow-xs">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {messages.length === 1 && !isLoading && (
              <div className="pt-2">
                <p className="text-[11px] font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-teal-600" />
                  Or tap a sample symptom description to test:
                </p>
                <div className="flex flex-wrap gap-2">
                  {samplePrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void submitIssue(prompt)}
                      className="rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-left text-xs text-slate-600 transition-all hover:border-teal-500 hover:bg-teal-50/50 hover:text-teal-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 shadow-2xs"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-teal-500 text-white shadow-xs">
                  <CareAssistantLogo className="h-4 w-4" />
                </div>
                <div className="rounded-2xl rounded-bl-xs border border-slate-200/80 bg-white p-3.5 text-xs text-slate-600 shadow-2xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-teal-500 animate-ping" />
                  <span>Analyzing clinical symptoms and formulating triage guidance...</span>
                </div>
              </div>
            )}

            {/* Scroll Anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Pinned Input Box Container (shrink-0) */}
          <div className="shrink-0 border-t border-slate-200/80 bg-white p-3.5 sm:p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex gap-2 sm:gap-3">
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void submitIssue(input);
                  }
                }}
                placeholder="Describe the symptoms, duration, severity, and triggers..."
                className="h-11 sm:h-12 flex-1 rounded-xl border-slate-200 bg-slate-50 text-xs sm:text-sm transition-all focus:border-teal-500 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900"
                disabled={isLoading}
              />
              <Button
                onClick={() => void submitIssue(input)}
                disabled={isLoading || !input.trim()}
                className="h-11 sm:h-12 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 px-4 sm:px-5 text-white shadow-xs hover:from-teal-700 hover:to-teal-800 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
            <p className="mt-2 text-[11px] leading-normal text-slate-400 dark:text-slate-500">
              Always double-check allergies, ongoing medicines, and physician instructions before acting on any suggestions.
            </p>
          </div>
        </div>

        {/* Right Side: Care Plan Panel */}
        <div
          className={`w-full lg:w-[380px] xl:w-[410px] shrink-0 h-full flex flex-col min-h-0 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 shadow-xs overflow-hidden ${
            activeMobileTab === "plan" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Header (shrink-0) */}
          <div className="shrink-0 border-b border-slate-200/80 px-4 py-3 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                <Stethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-50">Care Plan</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Actionable guidance & specialist matching</p>
              </div>
            </div>
          </div>

          {/* Body (flex-1 overflow-y-auto min-h-0) */}
          <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3.5">
            {result ? (
              <div className="space-y-3.5">
                <div className="rounded-xl border border-teal-100 bg-teal-50/80 p-3.5 dark:border-teal-900/40 dark:bg-teal-950/30">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                    Suggested Specialist
                  </p>
                  <p className="mt-1 text-sm sm:text-base font-semibold text-teal-950 dark:text-teal-100">
                    {result.specialist}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Summary Guidance</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{result.response}</p>
                </div>

                {result.medicines && result.medicines.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Medicines to Discuss</p>
                    {result.medicines.map((medicine) => (
                      <div
                        key={medicine.name}
                        className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/60"
                      >
                        <div className="flex items-center gap-2">
                          <Pill className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{medicine.name}</p>
                        </div>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{medicine.purpose}</p>
                        {medicine.caution && (
                          <p className="mt-1.5 text-[11px] leading-4 text-amber-700 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/30 p-1.5 rounded-lg border border-amber-200/50 dark:border-amber-900/40">
                            {medicine.caution}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {result.selfCare && result.selfCare.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Self-Care Measures</p>
                    <div className="space-y-1.5">
                      {result.selfCare.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 shadow-2xs"
                        >
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[10px] font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-300 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.urgentWarning && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 dark:border-rose-900/40 dark:bg-rose-950/30">
                    <p className="text-xs font-semibold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                      Seek Urgent Attention If:
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-rose-700 dark:text-rose-300">
                      {result.urgentWarning}
                    </p>
                  </div>
                )}

                <div className="grid gap-2 pt-1 sm:grid-cols-2">
                  <Button
                    className="h-9 text-xs font-medium bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-700 hover:to-teal-800 shadow-xs"
                    onClick={() => navigate("/dashboard/book-appointment")}
                  >
                    <Calendar className="mr-1.5 h-3.5 w-3.5" />
                    Book Slot
                  </Button>
                  <Button
                    variant="outline"
                    className="h-9 text-xs font-medium border-slate-200 dark:border-slate-700"
                    onClick={() => navigate("/dashboard/doctor-directory")}
                  >
                    <DoctorSearchLogo className="mr-1.5 h-3.5 w-3.5" />
                    Find Doctor
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[220px] text-center p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30">
                <ClipboardPlus className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Awaiting Consultation Input</p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500 max-w-[220px]">
                  Describe your symptoms in the chat. Your clinical care plan and specialist guidance will generate here in real-time.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
