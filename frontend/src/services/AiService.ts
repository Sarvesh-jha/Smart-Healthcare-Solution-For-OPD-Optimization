import { api } from "./ApiService";

export interface MedicineSuggestion {
  name: string;
  purpose: string;
  caution: string;
}

export interface CarePlan {
  specialist: string;
  urgency: "Low" | "Moderate" | "High";
  category?: string;
  clinicalObservations?: string;
  recommendedActions: string[];
  suggestedTests: string[];
  medicines: MedicineSuggestion[];
  selfCare: string[];
  urgentWarning?: string;
}

export interface AiTriageResponse {
  reply: string;
  carePlan: CarePlan;
  provider?: "gemini" | "openai" | "clinical-nlp-engine";
  model?: string;
  summary?: string;
  specialist?: string;
  response?: string;
  medicines?: MedicineSuggestion[];
  selfCare?: string[];
  urgentWarning?: string;
  warning?: string;
  error?: string;
}

export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export const AiService = {
  async triage(query: string, history: ChatHistoryItem[] = []): Promise<AiTriageResponse> {
    return api.post<AiTriageResponse>("/ai/triage", {
      query,
      history,
    });
  },

  async careGuide(query: string, history: ChatHistoryItem[] = []): Promise<AiTriageResponse> {
    return api.post<AiTriageResponse>("/ai/care-guide", {
      query,
      history,
    });
  },
};
