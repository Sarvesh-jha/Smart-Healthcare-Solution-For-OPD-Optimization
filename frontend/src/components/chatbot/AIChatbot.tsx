import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Calendar,
  Activity,
  BookOpen,
  ClipboardList,
  FileText,
  MessageCircle,
  Pill,
  Send,
  Users,
  X,
} from "lucide-react";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/ApiService";
import { CareAssistantLogo } from "../icons/CareAssistantLogo";
import { DoctorSearchLogo } from "../icons/DoctorSearchLogo";
import { AI_ASSISTANT_NAME, AI_CARE_GUIDE_NAME } from "../../utils/brand";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const patientQuickActions = [
  { icon: CareAssistantLogo, label: "Ask Care Guide", color: "from-cyan-500 to-cyan-600" },
  { icon: DoctorSearchLogo, label: "Find Doctor", color: "from-teal-500 to-teal-600" },
  { icon: FileText, label: "Explain My Report", color: "from-blue-500 to-blue-600" },
  { icon: Pill, label: "Medicine Reminders", color: "from-teal-500 to-teal-600" },
  { icon: Calendar, label: "Book Appointment", color: "from-emerald-500 to-emerald-600" },
];

const doctorQuickActions = [
  { icon: Users, label: "View Today's Patients", color: "from-cyan-500 to-cyan-600" },
  { icon: Activity, label: "Check Live Queue", color: "from-teal-500 to-teal-600" },
  { icon: ClipboardList, label: "Generate Prescription", color: "from-blue-500 to-blue-600" },
  { icon: FileText, label: "View Patient History", color: "from-purple-500 to-purple-600" },
  { icon: BookOpen, label: "Clinical Guidelines", color: "from-emerald-500 to-emerald-600" },
];

export function AIChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `Hi! I'm ${AI_ASSISTANT_NAME}. I can help with care guidance, reports, appointments, and next-step planning.`,
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const quickActions = user?.role === "doctor" ? doctorQuickActions : patientQuickActions;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const appendAiMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        text,
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
  };

  const requestChatbotReply = async (message: string, history: Message[]) => {
    const response = await api.post<{ reply: string }>("/ai/chatbot", {
      message,
      history: history.map((item) => ({
        text: item.text,
        sender: item.sender,
      })),
    });

    return response.reply;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const reply = await requestChatbotReply(userMessage.text, [...messages, userMessage]);
      appendAiMessage(reply);
    } catch (error) {
      appendAiMessage("I couldn't reach the AI service just now. Please try again in a moment.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    const quickActionMessage: Message = {
      id: messages.length + 1,
      text: action,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, quickActionMessage]);
    setIsTyping(true);

    try {
      const reply = await requestChatbotReply(action, [...messages, quickActionMessage]);
      appendAiMessage(reply);
    } catch (error) {
      appendAiMessage("I couldn't reach the AI service just now. Please try again in a moment.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-2xl shadow-2xl transition-all duration-300 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16 ${
          isOpen
            ? "scale-95 bg-slate-950"
            : "animate-pulse-slow bg-gradient-to-br from-cyan-600 via-cyan-500 to-teal-500 hover:scale-110"
        }`}
        aria-label="Open care assistant"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <div className="relative">
            <MessageCircle className="h-6 w-6 text-white sm:h-7 sm:w-7" />
            <span className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full border-2 border-white bg-green-400" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-green-400" />
          </div>
        )}
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close chatbot overlay"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[2px] sm:hidden"
          />

          <div className="fixed inset-x-3 bottom-20 top-16 z-50 flex animate-slide-up flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 shadow-2xl shadow-slate-950/15 backdrop-blur sm:inset-x-auto sm:bottom-24 sm:right-6 sm:top-auto sm:h-[680px] sm:w-[420px]">
            <div className="rounded-t-[2rem] bg-[linear-gradient(135deg,_#0891b2_0%,_#0ea5a4_50%,_#0f766e_100%)] px-5 pb-5 pt-5 text-white">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-lg">
                    <CareAssistantLogo className="h-6 w-6" />
                  </div>
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{AI_ASSISTANT_NAME}</h3>
                      <p className="mt-1 flex items-center gap-1 text-xs text-cyan-100">
                        <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                        Online and ready to help
                      </p>
                    </div>
                    <div className="hidden rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 sm:block">
                      {user?.role === "doctor" ? "Doctor workflow" : "Patient workflow"}
                    </div>
                  </div>
                  <p className="mt-3 max-w-xs text-sm leading-6 text-cyan-50/90">
                    Ask about {AI_CARE_GUIDE_NAME}, appointments, reports, queues, or next care steps and I will guide you.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-slate-200 bg-slate-50/90 px-4 py-3">
              <div className="flex flex-wrap gap-2">
                {quickActions.slice(0, 3).map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action.label)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-all hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,_#f8fbfd_0%,_#ffffff_40%,_#f8fbfd_100%)] p-4 sm:p-5">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-3xl px-4 py-3 sm:max-w-[80%] ${
                      message.sender === "user"
                        ? "rounded-br-md bg-gradient-to-r from-cyan-600 to-teal-500 text-white shadow-md shadow-cyan-900/10"
                        : "rounded-bl-md border border-slate-200 bg-white text-slate-800 shadow-sm"
                    }`}
                  >
                    {message.sender === "ai" && (
                      <div className="mb-1 flex items-center gap-2">
                        <CareAssistantLogo className="h-3.5 w-3.5 text-cyan-600" />
                        <span className="text-xs font-semibold text-cyan-600">{AI_ASSISTANT_NAME}</span>
                      </div>
                    )}
                    <p className="text-sm leading-6">{message.text}</p>
                    <p
                      className={`mt-1 text-xs ${
                        message.sender === "user" ? "text-cyan-100" : "text-slate-400"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="rounded-3xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <CareAssistantLogo className="h-3.5 w-3.5 text-cyan-600" />
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "0ms" }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "150ms" }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-slate-200 bg-white px-4 py-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Quick Actions</p>
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  Tap a prompt
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action.label)}
                      className="group flex items-center gap-2 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-3 py-2 text-xs font-medium text-slate-700 transition-all hover:border-cyan-300 hover:from-cyan-50 hover:to-teal-50 hover:text-cyan-700"
                    >
                      <Icon className="h-3.5 w-3.5 text-slate-500 transition-colors group-hover:text-cyan-600" />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-b-[2rem] border-t border-slate-200 bg-white p-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                  className="h-11 flex-1 rounded-2xl border-slate-200 bg-slate-50 focus:border-cyan-500 focus:ring-cyan-500"
                />
                <Button
                  onClick={handleSendMessage}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-500 p-0 text-white shadow-md hover:from-cyan-700 hover:to-teal-600"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(8, 145, 178, 0.7);
          }
          50% {
            box-shadow: 0 0 0 15px rgba(8, 145, 178, 0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s infinite;
        }
      `}</style>
    </>
  );
}
