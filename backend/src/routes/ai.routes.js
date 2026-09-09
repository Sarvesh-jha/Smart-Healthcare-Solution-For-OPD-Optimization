import express from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth.js";
import { generateClinicalTriage, generateChatbotReply } from "../services/ai.service.js";

const router = express.Router();

const triageRequestSchema = z.object({
  query: z.string().optional(),
  issue: z.string().optional(),
  message: z.string().optional(),
  history: z
    .array(
      z.object({
        text: z.string().optional(),
        content: z.string().optional(),
        sender: z.enum(["user", "ai"]).optional(),
        role: z.enum(["user", "model", "assistant"]).optional(),
      }),
    )
    .optional()
    .default([]),
});

const chatbotSchema = z.object({
  message: z.string().min(1),
  history: z
    .array(
      z.object({
        text: z.string(),
        sender: z.enum(["user", "ai"]),
      }),
    )
    .optional()
    .default([]),
});

async function handleTriageEndpoint(req, res) {
  try {
    const parsed = triageRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid triage request payload.",
        issues: parsed.error.flatten(),
      });
    }

    const rawQuery = parsed.data.query || parsed.data.issue || parsed.data.message;

    if (!rawQuery || rawQuery.trim().length < 2) {
      return res.status(400).json({
        message: "Please describe your symptoms or health query.",
      });
    }

    const normalizedHistory = (parsed.data.history || []).map((entry) => ({
      text: entry.text || entry.content || "",
      sender: entry.sender || (entry.role === "user" ? "user" : "ai"),
    }));

    const result = await generateClinicalTriage({
      query: rawQuery.trim(),
      history: normalizedHistory,
      userRole: req.user?.role || "patient",
    });

    return res.json(result);
  } catch (error) {
    console.error("Clinical triage request failed.", error);
    return res.status(500).json({ message: "Failed to generate clinical triage guidance." });
  }
}

// Wire /triage, /care-guide, and /doctor endpoints
router.post("/triage", authRequired, handleTriageEndpoint);
router.post("/care-guide", authRequired, handleTriageEndpoint);
router.post("/doctor", authRequired, handleTriageEndpoint);

router.post("/chatbot", authRequired, async (req, res) => {
  try {
    const parsed = chatbotSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid chatbot request.", issues: parsed.error.flatten() });
    }

    const reply = await generateChatbotReply({
      message: parsed.data.message,
      history: parsed.data.history,
      role: req.user?.role || "patient",
    });

    return res.json({ reply });
  } catch (error) {
    console.error("Chatbot request failed.", error);
    return res.status(500).json({ message: "Failed to generate chatbot reply." });
  }
});

export default router;
