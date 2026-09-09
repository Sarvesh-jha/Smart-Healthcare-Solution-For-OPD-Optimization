import { useState, useRef, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardPlus,
  Copy,
  FlaskConical,
  Pill,
  RotateCcw,
  Send,
  ShieldAlert,
  Stethoscope,
  User,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { AiService, CarePlan, ChatHistoryItem } from "../services/AiService";
import { CareAssistantLogo } from "../components/icons/CareAssistantLogo";
import { DoctorSearchLogo } from "../components/icons/DoctorSearchLogo";
import { AI_CARE_GUIDE_NAME } from "../utils/brand";

interface Message {
  id: number;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: 1,
    type: "ai",
    content:
      "Hello! I am your clinical AI triage assistant. Describe your symptoms in plain language — including their duration, severity, location, and any factors that make them better or worse. I will formulate a structured clinical assessment and care plan for you.",
    timestamp: new Date(),
  },
];

const samplePrompts = [
  "Crushing chest pain radiating to left arm with shortness of breath",
  "Persistent dry cough for 4 days with low-grade fever and wheezing",
  "Severe throbbing headache on right side with nausea and photophobia",
  "Burning epigastric chest sensation after spicy meals and acid reflux",
  "Spreading red itchy skin rash with hives across both arms",
  "Sharp lower back stiffness radiating down right sciatica nerve",
];

export function AiSymptomChecker() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [carePlan, setCarePlan] = useState<CarePlan | null>(null);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [apiNotice, setApiNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
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

    // Build chat history excluding the initial greeting
    const historyPayload: ChatHistoryItem[] = messages
      .filter((msg) => msg.id !== 1)
      .map((msg) => ({
        role: msg.type === "user" ? ("user" as const) : ("assistant" as const),
        content: msg.content,
      }));

    const userMsgId = Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        type: "user",
        content: trimmedInput,
        timestamp: new Date(),
      },
    ]);
    setInput("");
    setIsLoading(true);
    setError("");

    try {
      const triageResult = await AiService.triage(trimmedInput, historyPayload);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "ai",
          content: triageResult.reply || triageResult.response || "Assessment complete.",
          timestamp: new Date(),
        },
      ]);

      if (triageResult.carePlan) {
        setCarePlan(triageResult.carePlan);
      }
      if (triageResult.provider) {
        setActiveProvider(triageResult.provider);
      }
      if (triageResult.warning) {
        setApiNotice(triageResult.warning);
      } else {
        setApiNotice(null);
      }
    } catch (requestError: any) {
      const errMsg =
        requestError?.response?.data?.message ||
        requestError?.message ||
        "Failed to obtain AI clinical triage guidance. Please check server and GEMINI_API_KEY configuration.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages(initialMessages);
    setCarePlan(null);
    setActiveProvider(null);
    setApiNotice(null);
    setInput("");
    setError("");
  };

  const copySummaryToClipboard = async () => {
    if (!carePlan) return;
    const summaryText = `[MEDIrxCARE Clinical AI Care Plan]
Urgency: ${carePlan.urgency}
Recommended Specialist: ${carePlan.specialist}
Clinical Observations: ${carePlan.clinicalObservations || "N/A"}

Recommended Next Actions:
${(carePlan.recommendedActions || []).map((a, i) => `${i + 1}. ${a}`).join("\n")}

Suggested Diagnostic Investigations:
${(carePlan.suggestedTests || []).map((t, i) => `- ${t}`).join("\n")}

Medicines to Discuss:
${(carePlan.medicines || []).map((m) => `- ${m.name}: ${m.purpose} (Caution: ${m.caution})`).join("\n")}

Self-Care & Measures:
${(carePlan.selfCare || []).map((s, i) => `${i + 1}. ${s}`).join("\n")}

Emergency Warning:
${carePlan.urgentWarning || "Seek immediate emergency attention for sudden severe symptoms."}
`;
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (_err) {
      // ignore
    }
  };

  const renderUrgencyBadge = (urgency: "Low" | "Moderate" | "High") => {
    switch (urgency) {
      case "High":
        return (
          <div className="flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-300 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            High Urgency • Immediate Medical Review
          </div>
        );
      case "Moderate":
        return (
          <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Moderate Urgency • Evaluate Within 24-48h
          </div>
        );
      case "Low":
      default:
        return (
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Low Urgency • Routine Outpatient Care
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden gap-3">
      {/* Emergency Triage Notice (shrink-0) */}
      <div className="shrink-0 rounded-xl border border-rose-200/90 bg-rose-50/80 px-3.5 py-2 text-xs shadow-2xs dark:border-rose-950/60 dark:bg-rose-950/20">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <div className="text-[11px] sm:text-xs leading-relaxed text-rose-800 dark:text-rose-300">
              <strong className="font-semibold text-rose-900 dark:text-rose-200">Clinical Emergency Warning: </strong>
              If experiencing acute chest pressure, radiating arm/jaw pain, acute breathlessness, or sudden weakness, call <strong>108 / 112</strong> immediately.
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeProvider && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-800 shrink-0">
                <Activity className="h-3 w-3 text-teal-500" />
                Engine: {activeProvider === "gemini" ? "Google GenAI (Gemini Flash)" : activeProvider === "openai" ? "OpenAI" : "Clinical NLP Engine"}
              </span>
            )}
            {apiNotice && (
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50/90 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200/70 dark:border-amber-800 shrink-0">
                {apiNotice}
              </span>
            )}
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
          {carePlan && (
            <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-teal-300 align-middle" />
          )}
        </button>
      </div>

      {/* Main Viewport Content Split: Chat Stream + Care Plan Panel */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3.5 overflow-hidden">
        {/* Left Side: Full-Height Chat Interface */}
        <div
          className={`flex-1 min-h-0 flex flex-col rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-[#131926] shadow-xs overflow-hidden ${
            activeMobileTab === "chat" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Chat Header (shrink-0) */}
          <div className="shrink-0 border-b border-slate-200/80 bg-white px-4 py-3 dark:border-slate-800/80 dark:bg-[#131926]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-teal-500 text-white shadow-xs shadow-cyan-500/20">
                  <CareAssistantLogo className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{AI_CARE_GUIDE_NAME}</p>
                    <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-700 border border-teal-200/60 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800">
                      Clinical Triage
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Clinical assessment with evidence-based next steps</p>
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
          <div className="flex-1 overflow-y-auto min-h-0 space-y-4 p-4 sm:p-5 bg-[linear-gradient(180deg,_#f8fbfd_0%,_#ffffff_30%,_#f8fbfd_100%)] dark:bg-[#0B0F17] scroll-smooth">
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
                <p className="text-[11px] font-medium text-slate-400 mb-2">
                  Common health scenarios:
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
                  <span>Synthesizing clinical symptoms, differential indicators, and care plan...</span>
                </div>
              </div>
            )}

            {/* Scroll Anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Pinned Input Box Container (shrink-0) */}
          <div className="shrink-0 border-t border-slate-200/80 bg-white p-3.5 sm:p-4 dark:border-slate-800/80 dark:bg-[#131926]">
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
                placeholder="Describe symptoms, duration, location, severity, and triggers..."
                className="h-11 sm:h-12 flex-1 rounded-xl border-slate-200 bg-slate-50 text-xs sm:text-sm transition-all focus:border-teal-500 focus:ring-teal-500 dark:border-slate-700/70 dark:bg-slate-900"
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
            {error && <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
            <p className="mt-2 text-[11px] leading-normal text-slate-400 dark:text-slate-500">
              Clinical decision support tool only. Consult a registered medical practitioner for definitive diagnosis and treatment.
            </p>
          </div>
        </div>

        {/* Right Side: Care Plan Panel */}
        <div
          className={`w-full lg:w-[410px] xl:w-[440px] shrink-0 h-full flex flex-col min-h-0 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-[#131926] shadow-xs overflow-hidden ${
            activeMobileTab === "plan" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Header (shrink-0) */}
          <div className="shrink-0 border-b border-slate-200/80 px-4 py-3 bg-slate-50/60 dark:border-slate-800/80 dark:bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                <Stethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">Care Plan</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Actionable guidance & specialist triage</p>
              </div>
            </div>

            {carePlan && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void copySummaryToClipboard()}
                className="h-7 px-2 text-[11px] text-slate-500 hover:text-teal-600 dark:text-slate-400"
                title="Copy Care Plan"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
          </div>

          {/* Body (flex-1 overflow-y-auto min-h-0) */}
          <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3.5">
            {carePlan ? (
              <div className="space-y-3.5">
                {/* Urgency & Specialist Card */}
                <div className="rounded-xl border border-teal-100 bg-teal-50/80 p-3.5 dark:border-teal-900/40 dark:bg-teal-950/30 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                      Triage Assessment
                    </span>
                    {renderUrgencyBadge(carePlan.urgency)}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Recommended Specialty:</p>
                    <p className="text-base font-bold text-teal-950 dark:text-teal-100 flex items-center gap-1.5 mt-0.5">
                      {carePlan.specialist}
                    </p>
                  </div>
                </div>

                {/* Clinical Observations */}
                {carePlan.clinicalObservations && (
                  <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Stethoscope className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                      Clinical Assessment
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {carePlan.clinicalObservations}
                    </p>
                  </div>
                )}

                {/* Recommended Immediate Actions */}
                {carePlan.recommendedActions && carePlan.recommendedActions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                      Recommended Next Actions
                    </p>
                    <div className="space-y-1.5">
                      {carePlan.recommendedActions.map((action, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 shadow-2xs"
                        >
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[10px] font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-300 mt-0.5 border border-teal-200/50 dark:border-teal-800">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Diagnostic Investigations */}
                {carePlan.suggestedTests && carePlan.suggestedTests.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <FlaskConical className="h-3.5 w-3.5 text-teal-600" />
                        Diagnostic Tests & Investigations
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate("/dashboard/tests-services")}
                        className="text-[10px] font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 flex items-center gap-0.5"
                      >
                        Book Tests <ArrowRight className="h-2.5 w-2.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {carePlan.suggestedTests.map((testName, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 rounded-lg border border-slate-200/70 bg-slate-50/70 px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0" />
                          <span className="font-medium">{testName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medicines to Discuss */}
                {carePlan.medicines && carePlan.medicines.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Pill className="h-3.5 w-3.5 text-teal-600" />
                      Medications to Discuss with Physician
                    </p>
                    {carePlan.medicines.map((medicine) => (
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

                {/* Self-Care Measures */}
                {carePlan.selfCare && carePlan.selfCare.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Self-Care & Recovery Measures</p>
                    <div className="space-y-1.5">
                      {carePlan.selfCare.map((step, idx) => (
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

                {/* Urgent Warning / Red Flags */}
                {carePlan.urgentWarning && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 dark:border-rose-900/40 dark:bg-rose-950/30">
                    <p className="text-xs font-semibold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                      Seek Emergency Attention If:
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-rose-700 dark:text-rose-300">
                      {carePlan.urgentWarning}
                    </p>
                  </div>
                )}

                {/* Quick Action Navigation Buttons */}
                <div className="grid gap-2 pt-2 sm:grid-cols-2">
                  <Button
                    className="h-9 text-xs font-medium bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-700 hover:to-teal-800 shadow-xs"
                    onClick={() => navigate("/dashboard/book-appointment")}
                  >
                    <Calendar className="mr-1.5 h-3.5 w-3.5" />
                    Book with {carePlan.specialist || "Doctor"}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-9 text-xs font-medium border-slate-200 dark:border-slate-700"
                    onClick={() => navigate("/dashboard/doctor-directory")}
                  >
                    <DoctorSearchLogo className="mr-1.5 h-3.5 w-3.5" />
                    Find Specialists
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[220px] text-center p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30">
                <ClipboardPlus className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Awaiting Consultation Input</p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500 max-w-[240px]">
                  Describe your symptoms in the chat. Your clinical care plan, urgency classification, and diagnostic tests will generate here in real-time.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
