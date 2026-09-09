import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import { env } from "../config/env.js";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY !== undefined ? process.env.GEMINI_API_KEY : env.geminiApiKey;
  if (!apiKey || !apiKey.trim()) return null;
  return new GoogleGenAI({ apiKey: apiKey.trim() });
}

function getOpenAiClient() {
  const apiKey = process.env.OPENAI_API_KEY || env.openAiApiKey;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

export function normalizeSpecialist(rawSpecialist) {
  const text = String(rawSpecialist || "").toLowerCase();
  if (text.includes("cardio")) return "Cardiologist";
  if (text.includes("pulmon") || text.includes("respirat")) return "Pulmonologist";
  if (text.includes("neuro")) return "Neurologist";
  if (text.includes("gastro") || text.includes("digest")) return "Gastroenterologist";
  if (text.includes("derma")) return "Dermatologist";
  if (text.includes("ortho")) return "Orthopedic Surgeon";
  if (text.includes("ent") || text.includes("otolaryng")) return "ENT Specialist";
  if (text.includes("endo") || text.includes("diabet")) return "Endocrinologist";
  if (text.includes("urolog") || text.includes("nephro")) return "Nephrologist / Urologist";
  if (text.includes("pediatric")) return "Pediatrician";
  return rawSpecialist || "General Physician";
}

/**
 * Robust, Dynamic Rule-Based Medical NLP Triage Parser
 * Covers 12+ clinical categories with red-flag emergency detection,
 * non-diagnostic observations, recommended specialists, actions, tests, and self-care.
 */
export function executeMedicalNlpTriage(query, history = []) {
  const text = query.toLowerCase();

  // 1. Red Flag / Acute Emergency Protocol Detection
  const isEmergency =
    /(crushing|squeezing|radiating|tightness in chest|left arm pain|severe breathlessness|unable to breathe|gasping|blue lips|coughing up blood|vomiting blood|slurred speech|facial droop|one[- ]sided weakness|loss of consciousness|fainted|seizure|convulsion|anaphylaxis|throat swelling|black stool)/i.test(
      text,
    );

  // 2. Cardiac / Vascular Symptoms
  const isCardiac =
    /(chest pain|chest pressure|chest tightness|angina|palpitation|racing heart|irregular pulse|high bp|hypertension|ankle swelling|heart attack|cardiac)/i.test(
      text,
    );

  // 3. Neurological Symptoms
  const isNeurological =
    /(headache|migraine|cluster headache|throbbing head|dizziness|vertigo|spinning sensation|numbness|tingling|light sensitivity|photophobia|aura|concussion)/i.test(
      text,
    );

  // 4. Respiratory / Pulmonology Symptoms
  const isRespiratory =
    /(cough|dry cough|wet cough|phlegm|sputum|wheezing|asthma|bronchitis|sore throat|congestion|sinus|runny nose|\bcold\b|\bflu\b|sneezing|stridor)/i.test(
      text,
    );

  // 5. Gastrointestinal Symptoms
  const isGastrointestinal =
    /(stomach pain|abdominal pain|acidity|heartburn|acid reflux|gerd|cramp|nausea|vomit|diarrhea|loose motion|bloat|indigestion|constipation|\bgas\b|food poison|epigastric|gastric|reflux)/i.test(
      text,
    );

  // 6. Dermatological Symptoms
  const isDermatological =
    /(rash|itching|itchy|hives|urticaria|red bumps|eczema|psoriasis|skin lesion|blister|ringworm|fungal|\bacne\b|dermatitis|\bboil\b)/i.test(
      text,
    );

  // 7. Orthopedic / Musculoskeletal Symptoms
  const isOrthopedic =
    /(back pain|lower back|lumbar|sciatica|knee pain|joint pain|shoulder pain|neck stiffness|neck pain|sprain|strain|arthritis|swollen joint|ligament)/i.test(
      text,
    );

  // 8. Endocrine / Metabolic Symptoms
  const isEndocrine =
    /(high blood sugar|diabetes|excessive thirst|frequent urination|unexplained weight loss|thyroid|chronic fatigue|sluggishness)/i.test(
      text,
    );

  // 9. ENT (Ear, Nose, Throat) Symptoms
  const isENT =
    /(ear pain|earache|ear discharge|hearing loss|ringing in ear|tinnitus|tonsil|difficulty swallowing|sinus pressure)/i.test(
      text,
    );

  // 10. Urology / Nephrology Symptoms
  const isUrological =
    /(burning urination|dysuria|frequent urination|flank pain|kidney stone|cloudy urine|painful urination)/i.test(
      text,
    );

  // Default Clinical Assessment Setup
  let specialist = "General Physician";
  let urgency = "Moderate";
  let observations = "";
  let actions = [];
  let tests = [];
  let medicines = [];
  let selfCare = [];
  let urgentWarning =
    "Seek prompt emergency evaluation for severe sudden pain, difficulty breathing, confusion, or sudden weakness.";

  if (isEmergency || (isCardiac && /(crushing|severe|radiating|left arm|jaw|sweat)/i.test(text))) {
    specialist = "Cardiologist";
    urgency = "High";
    observations =
      "Your reported symptoms match a high-priority acute cardiovascular or systemic emergency pattern. The presence of acute chest tightness, radiating sensations, or breathing difficulties warrants immediate emergency evaluation.";
    actions = [
      "Sit upright in a comfortable, well-ventilated space immediately.",
      "Call emergency services (108 / 112) or arrange immediate transport to the nearest Emergency Department.",
      "Do NOT drive yourself to the clinic or hospital.",
      "Loosen tight clothing around neck, chest, and waist.",
      "Check and record blood pressure and heart rate if an automated cuff is available.",
    ];
    tests = [
      "12-Lead Electrocardiogram (ECG)",
      "High-Sensitivity Troponin-I / Troponin-T",
      "Echocardiogram (2D Echo)",
      "Cardiac Enzymes & Lipid Panel",
    ];
    medicines = [
      {
        name: "Aspirin (Dispirin 300mg)",
        purpose: "May be advised by emergency physicians for suspected acute cardiac ischemia (chewable).",
        caution: "Do not take without emergency medical advice, or if allergic to NSAIDs or actively bleeding.",
      },
      {
        name: "Sorbitrate (Sublingual Nitrate)",
        purpose: "Vasodilator for patients with previously diagnosed angina.",
        caution: "Contraindicated if blood pressure is severely low or taken with phosphodiesterase inhibitors.",
      },
    ];
    selfCare = [
      "Cease all physical activity immediately and sit stationary.",
      "Keep calm, take slow measured breaths through nose and mouth.",
      "Ensure an emergency contact or family member remains by your side.",
    ];
    urgentWarning =
      "CRITICAL: Crushing chest pain, left-arm/jaw radiation, diaphoresis (cold sweats), or shortness of breath requires immediate emergency hospital admission.";
  } else if (isCardiac) {
    specialist = "Cardiologist";
    urgency = "Moderate";
    observations =
      "The described symptoms may point towards cardiovascular strain, palpitations, or blood pressure fluctuation. A comprehensive evaluation helps differentiate benign rhythm irregularities from coronary or structural heart concerns.";
    actions = [
      "Log your blood pressure and resting pulse twice daily (morning and evening).",
      "Avoid caffeine, stimulants, nicotine, and strenuous physical exertion.",
      "Schedule a dedicated clinical consultation with a cardiologist.",
      "Maintain a symptom diary noting time, posture, and dietary triggers.",
    ];
    tests = [
      "12-Lead Resting ECG",
      "Lipid Profile (Total Cholesterol, LDL, HDL, Triglycerides)",
      "Echocardiography (2D Echo with Doppler)",
      "HbA1c & Fasting Blood Glucose",
    ];
    medicines = [
      {
        name: "Prescribed Antihypertensive / Antiarrhythmic (if on therapy)",
        purpose: "Maintains optimal vascular tone and heart rate rhythm.",
        caution: "Never modify, skip, or abruptly cease cardiovascular medication without cardiologist oversight.",
      },
    ];
    selfCare = [
      "Practice daily 10-minute relaxation breathing to alleviate sympathetic arousal.",
      "Reduce dietary sodium (< 2g/day) and prioritize magnesium/potassium-rich foods.",
      "Sleep with head slightly elevated if breathlessness occurs upon lying flat.",
    ];
    urgentWarning =
      "Seek emergency care immediately if palpitations are accompanied by dizziness, syncope (fainting), chest pressure, or shortness of breath.";
  } else if (isNeurological) {
    specialist = "Neurologist";
    urgency = /(sudden|worst headache|thunderclap|droop|slurred|weakness)/i.test(text) ? "High" : "Moderate";
    observations =
      "Your symptoms suggest a neurological pattern such as migraine, vascular headache, or cervical tension. The specific location, duration, and sensory sensitivities (light, sound) are key clinical factors.";
    actions = [
      "Rest in a dark, quiet, temperature-controlled room.",
      "Apply an ice pack or cold gel compress to the forehead or base of neck for 15 minutes.",
      "Hydrate with oral electrolyte fluids.",
      "Avoid screen time, bright fluorescent lighting, and loud acoustics.",
    ];
    tests = [
      "MRI Brain (Non-Contrast)",
      "Blood Pressure Monitoring Profile",
      "Cervical Spine X-Ray (if neck tension present)",
      "Comprehensive Neurological Physical Exam",
    ];
    medicines = [
      {
        name: "Paracetamol (500mg - 650mg)",
        purpose: "Analgesic for tension or vascular headache discomfort.",
        caution: "Do not exceed 3 grams within 24 hours; avoid combination cold remedies containing duplicate acetaminophen.",
      },
      {
        name: "Naproxen / Ibuprofen (NSAID)",
        purpose: "Reduces neurogenic inflammation in migraine episodes.",
        caution: "Always consume with food; avoid if you have gastritis, renal impairment, or peptic ulcers.",
      },
    ];
    selfCare = [
      "Hydrate with 500ml of room-temperature water or coconut water.",
      "Gently massage temples, jaw, and trapezius muscles.",
      "Maintain consistent sleep and meal schedules to avoid triggering headaches.",
    ];
    urgentWarning =
      "Seek urgent medical attention for sudden 'thunderclap' headaches, facial numbness, limb weakness, speech difficulties, or visual loss.";
  } else if (isRespiratory) {
    specialist = "Pulmonologist";
    urgency = /(breathless|cannot breathe|high fever|wheezing continuously|gasping)/i.test(text)
      ? "High"
      : "Moderate";
    observations =
      "The clinical presentation indicates a respiratory tract irritation or infection, ranging from acute viral bronchitis to seasonal asthma or allergic rhinitis. Monitoring airway clearance and oxygen saturation is essential.";
    actions = [
      "Perform steam inhalation for 10-15 minutes twice daily.",
      "Check blood oxygen saturation (SpO2) using a fingertip pulse oximeter.",
      "Drink warm fluids such as ginger-honey water, herbal teas, or clear broths.",
      "Elevate head with two pillows to facilitate nocturnal airway drainage.",
    ];
    tests = [
      "Chest X-Ray (PA View)",
      "Complete Blood Count (CBC) with Differential",
      "Pulse Oximetry (SpO2) Monitoring",
      "Spirometry / Pulmonary Function Test (if chronic wheezing)",
    ];
    medicines = [
      {
        name: "Dextromethorphan (for persistent dry cough)",
        purpose: "Antitussive agent that calms bronchial cough reflex.",
        caution: "Not recommended for productive (mucus-filled) coughs or patients with chronic obstructive airway disease.",
      },
      {
        name: "Guaifenesin / Ambroxol (for productive cough)",
        purpose: "Expectorant that thins viscous bronchial mucus for easier clearance.",
        caution: "Maintain generous fluid intake to maximize expectorant efficacy.",
      },
      {
        name: "Paracetamol (500mg)",
        purpose: "Reduces associated fever, chills, and muscle aches.",
        caution: "Space doses at least 6 hours apart.",
      },
    ];
    selfCare = [
      "Gargle with warm saline water (1/2 tsp salt in 1 glass warm water) 3 times daily.",
      "Avoid exposure to aerosol sprays, tobacco smoke, dust, and cold night drafts.",
      "Use an indoor humidifier or bowl of warm water in dry environments.",
    ];
    urgentWarning =
      "Seek immediate medical care if you develop severe breathlessness, SpO2 dropping below 94%, high fever >103°F, or coughing up blood.";
  } else if (isGastrointestinal) {
    specialist = "Gastroenterologist";
    urgency = /(blood in vomit|black stool|severe unbearable pain|rigid belly)/i.test(text) ? "High" : "Low";
    observations =
      "Symptoms correlate with gastrointestinal distress, such as acid reflux (GERD), gastritis, acute gastroenteritis, or functional dyspepsia. Hydration and gut resting are central to initial stabilization.";
    actions = [
      "Switch to a bland, easily digestible diet (BRAT: Bananas, Rice, Applesauce, Toast).",
      "Sip Oral Rehydration Salts (ORS) slowly in small quantities.",
      "Remain upright for at least 2 hours following any meal.",
      "Avoid NSAID painkillers (like ibuprofen) which aggravate the stomach lining.",
    ];
    tests = [
      "Ultrasound Whole Abdomen & Pelvis",
      "Stool Routine & Microscopy (if diarrhea present)",
      "Liver Function Test (LFT) & Serum Amylase",
      "Upper GI Endoscopy (for recurrent acid reflux)",
    ];
    medicines = [
      {
        name: "Pantoprazole (40mg) or Rabeprazole",
        purpose: "Proton Pump Inhibitor (PPI) that reduces excess gastric acid secretion.",
        caution: "Take once daily on an empty stomach 30 minutes before morning breakfast.",
      },
      {
        name: "Oral Rehydration Salts (ORS)",
        purpose: "Restores crucial sodium, potassium, and glucose electrolyte balance.",
        caution: "Dissolve 1 full sachet in exactly 1 litre of safe drinking water; do not add sugar.",
      },
    ];
    selfCare = [
      "Avoid fried, spicy, oily, citrus, caffeinated, and carbonated items.",
      "Eat small meals every 3-4 hours rather than heavy feasts.",
      "Apply a gentle warm compress to the abdomen for cramping discomfort.",
    ];
    urgentWarning =
      "Immediate medical evaluation is critical for vomiting blood, black tarry stools, sharp localized right lower abdominal pain, or inability to retain fluids.";
  } else if (isDermatological) {
    specialist = "Dermatologist";
    urgency = /(throat swelling|swollen lips|blisters all over|fever and rash)/i.test(text) ? "High" : "Low";
    observations =
      "The clinical signs suggest dermatological inflammation, allergic contact dermatitis, urticaria (hives), or fungal/microbial infection. Preserving the skin barrier and avoiding scratching are key.";
    actions = [
      "Apply a cool, damp cloth compress to soothe itching and reduce local inflammation.",
      "Use a mild, hypoallergenic, fragrance-free moisturizing lotion.",
      "Wear loose-fitting, breathable 100% cotton clothing.",
      "Trim fingernails to avoid secondary bacterial infections from scratching.",
    ];
    tests = [
      "Skin Scraping / KOH Mount (for suspected fungal infection)",
      "Complete Blood Count (CBC) with Absolute Eosinophil Count",
      "Serum Total IgE & Allergy Panel",
      "Dermatoscopy Examination",
    ];
    medicines = [
      {
        name: "Cetirizine (10mg) or Levocetirizine (5mg)",
        purpose: "Second-generation antihistamine for itch relief and allergic rash suppression.",
        caution: "May cause mild drowsiness in sensitive individuals; best taken at bedtime.",
      },
      {
        name: "Calamine Topical Lotion",
        purpose: "Soothes superficial pruritus, sunburn, and mild urticaria.",
        caution: "For external use only; avoid application on open wounds or mucosal membranes.",
      },
    ];
    selfCare = [
      "Bathe in lukewarm water rather than hot water, keeping showers under 10 minutes.",
      "Gently pat skin dry with a clean towel; avoid harsh rubbing.",
      "Identify and discontinue any newly introduced cosmetic products, soaps, or detergents.",
    ];
    urgentWarning =
      "Seek emergency assistance if rash spreads rapidly with facial/lip swelling, difficulty swallowing, breathlessness, or skin peeling.";
  } else if (isOrthopedic) {
    specialist = "Orthopedic Surgeon";
    urgency = /(bladder control|bowel control|cannot stand|severe trauma|bone visible)/i.test(text)
      ? "High"
      : "Low";
    observations =
      "Your reported symptoms align with musculoskeletal strain, lumbar radiculopathy (sciatica), or joint inflammation. Protecting the affected joint and managing load distribution is recommended.";
    actions = [
      "Apply the R.I.C.E protocol (Rest, Ice, Compression, Elevation) to acute joint injuries.",
      "Apply an ice pack wrapped in a cloth for 15 minutes, 3 times daily.",
      "Maintain neutral spinal posture; avoid deep forward bending or twisting under load.",
      "Sleep on a firm mattress with a supporting pillow between or beneath the knees.",
    ];
    tests = [
      "Digital X-Ray of Affected Joint / Spine (AP & Lateral views)",
      "MRI Lumbar Spine / Joint (for nerve compression or ligament evaluation)",
      "Serum Uric Acid & Erythrocyte Sedimentation Rate (ESR)",
      "Serum Calcium & Vitamin D3 Profile",
    ];
    medicines = [
      {
        name: "Diclofenac / Methyl Salicylate Gel (Topical)",
        purpose: "Local anti-inflammatory and pain-relieving transdermal gel.",
        caution: "Apply gently without vigorous friction; wash hands thoroughly after use.",
      },
      {
        name: "Paracetamol (650mg)",
        purpose: "Basic analgesic for mild to moderate musculoskeletal aches.",
        caution: "Avoid prolonged consecutive use without medical consultation.",
      },
    ];
    selfCare = [
      "Avoid prolonged static sitting or standing; change posture every 40 minutes.",
      "Engage in gentle pain-free walking on flat surfaces once acute pain subsides.",
      "Use supportive ergonomic seating with dedicated lumbar cushions.",
    ];
    urgentWarning =
      "Seek emergency orthopedic review if you experience sudden loss of bowel or bladder control, numbness in the saddle/groin area, or complete inability to bear weight.";
  } else if (isEndocrine) {
    specialist = "Endocrinologist";
    urgency = "Moderate";
    observations =
      "Symptoms suggest metabolic or hormonal dysregulation, commonly seen in glycemic fluctuations, thyroid disorders, or endocrine fatigue syndromes. Objective biochemical testing provides clear diagnosis.";
    actions = [
      "Maintain a 7-day log of daily fasting and 2-hour post-meal blood glucose levels.",
      "Drink 2.5 to 3 liters of plain water daily.",
      "Incorporate balanced meals emphasizing complex fiber, lean proteins, and low glycemic index carbohydrates.",
      "Schedule a consultation with an endocrinologist or diabetologist.",
    ];
    tests = [
      "Fasting Blood Sugar (FBS) & Postprandial Blood Sugar (PPBS)",
      "HbA1c (Glycated Hemoglobin 3-Month Average)",
      "Thyroid Function Panel (Total T3, Total T4, Ultrasensitive TSH)",
      "Lipid Profile & Serum Creatinine",
    ];
    medicines = [
      {
        name: "Prescribed Diabetes / Thyroid Medication (if existing patient)",
        purpose: "Maintains hormonal equilibrium and glycemic control.",
        caution: "Never self-adjust insulin units or levothyroxine dosage without laboratory confirmation.",
      },
    ];
    selfCare = [
      "Maintain a fixed meal timing schedule to avoid hypoglycemic drops.",
      "Engage in 30 minutes of moderate aerobic activity (e.g. brisk walking) 5 days a week.",
      "Inspect feet daily for cuts, blisters, or pressure sores.",
    ];
    urgentWarning =
      "Seek urgent care for extreme lethargy, confusion, deep rapid breathing, fruity breath odor, or persistently high glucose (>300 mg/dL).";
  } else if (isENT) {
    specialist = "ENT Specialist";
    urgency = "Moderate";
    observations =
      "Symptoms reflect upper airway or otorhinolaryngological involvement such as acute otitis, sinusitis, pharyngitis, or Eustachian tube dysfunction.";
    actions = [
      "Perform warm saline gargles (3-4 times daily) for pharyngeal soothing.",
      "Administer steam inhalation with eucalyptus oil to facilitate sinus drainage.",
      "Keep ear canals strictly dry; avoid inserting cotton swabs or ear candles.",
    ];
    tests = [
      "Diagnostic Video Otoscopy",
      "Pure Tone Audiometry (PTA) & Tympanometry",
      "X-Ray / CT Paranasal Sinuses (Water's View)",
      "Throat Swab Culture & Sensitivity",
    ];
    medicines = [
      {
        name: "Saline Nasal Spray (0.9% NaCl)",
        purpose: "Moisturizes nasal mucosal membranes and clears sinus crusts.",
        caution: "Non-medicated and safe for frequent use.",
      },
      {
        name: "Paracetamol (500mg)",
        purpose: "Relieves earache and throat discomfort.",
        caution: "Take with water; do not exceed daily limit.",
      },
    ];
    selfCare = [
      "Stay hydrated with warm broths, herbal teas, and soups.",
      "Avoid flying or underwater diving while suffering from acute ear congestion.",
      "Rest vocal cords if experiencing hoarseness or laryngitis.",
    ];
    urgentWarning =
      "Seek emergency care for sudden hearing loss, severe swelling behind the ear, high fever with stiff neck, or difficulty swallowing saliva.";
  } else if (isUrological) {
    specialist = "Urologist";
    urgency = /(fever with chills|severe back pain|visible blood in urine)/i.test(text) ? "High" : "Moderate";
    observations =
      "The clinical presentation points toward urinary tract irritation, infection (UTI), or renal calculus (kidney stone) passage. Prompt urinalysis and hydration are foundational.";
    actions = [
      "Increase daily water intake to 2.5 - 3.5 liters unless medically fluid-restricted.",
      "Empty bladder promptly without holding urine.",
      "Collect a midstream clean-catch urine sample for laboratory testing.",
    ];
    tests = [
      "Urine Routine & Microscopic Examination",
      "Urine Culture and Antibiotic Sensitivity",
      "Ultrasound KUB (Kidney, Ureter, Bladder)",
      "Serum Creatinine & Blood Urea Nitrogen (BUN)",
    ];
    medicines = [
      {
        name: "Disodium Hydrogen Citrate Syrup",
        purpose: "Systemic urinary alkalizer to reduce burning during micturition.",
        caution: "Dilute in a full glass of water; consult doctor if hypertensive or cardiac patient.",
      },
    ];
    selfCare = [
      "Avoid caffeinated beverages, alcohol, and artificial sweeteners.",
      "Maintain clean, dry personal hygiene with gentle water cleansing.",
      "Apply a warm water bottle to the lower pelvic area for cramp relief.",
    ];
    urgentWarning =
      "Seek urgent care for visible blood in urine, fever with chills, severe intractable flank pain, or inability to pass urine.";
  } else {
    // General Health / Wellness Assessment
    specialist = "General Physician";
    urgency = "Low";
    observations =
      "Based on your description, your symptoms appear consistent with general physical fatigue, mild viral prodrome, or lifestyle-related physical strain. A structured review and basic health tracking are recommended.";
    actions = [
      "Track your symptoms over the next 24-48 hours, noting any escalation or new signs.",
      "Maintain adequate rest (7-8 hours of sound sleep).",
      "Hydrate well with clean drinking water, coconut water, or fresh broths.",
      "Consult a General Physician if symptoms do not improve within 3 days.",
    ];
    tests = [
      "Complete Blood Count (CBC) with Platelets",
      "Erythrocyte Sedimentation Rate (ESR)",
      "Basic Metabolic Panel / Serum Electrolytes",
      "Routine Urine Examination",
    ];
    medicines = [
      {
        name: "Paracetamol (500mg)",
        purpose: "Supportive relief for generalized malaise or low fever.",
        caution: "Take with food and water; avoid if contraindicated.",
      },
      {
        name: "Multivitamin / B-Complex with Vitamin C",
        purpose: "General nutritional immune support.",
        caution: "Best taken after morning breakfast.",
      },
    ];
    selfCare = [
      "Eat light, nourishing, home-cooked meals.",
      "Avoid heavy physical strain and ensure proper ventilation.",
      "Keep a log of temperature, appetite, and energy levels.",
    ];
    urgentWarning =
      "Seek emergency medical evaluation if you experience sudden chest pain, shortness of breath, severe dizziness, or loss of consciousness.";
  }

  // Construct structured human conversational reply following clinical guardrails
  const reply = [
    `### Clinical Assessment & Observations`,
    `${observations}`,
    ``,
    `### Recommended Specialty`,
    `**${specialist}** (Triage Urgency: **${urgency}**)`,
    ``,
    `### Self-Care & Immediate Safe Measures`,
    ...actions.map((act) => `• ${act}`),
    ``,
    `### Diagnostic Tests to Consider`,
    ...tests.map((t) => `• ${t}`),
    ``,
    `### Red Flags & Urgent Warning`,
    `⚠️ ${urgentWarning}`,
    ``,
    `*Clinical Disclaimer: This assessment is generated for educational clinical triage and symptom awareness. It does not replace formal clinical diagnosis or treatment by a licensed physician.*`,
  ].join("\n");

  const carePlan = {
    specialist,
    urgency,
    recommendedActions: actions,
    suggestedTests: tests,
    medicines,
    selfCare,
    urgentWarning,
  };

  return {
    reply,
    carePlan,
    summary: observations,
    specialist,
    urgency,
    response: reply,
    medicines,
    selfCare,
    urgentWarning,
  };
}

/**
 * Main Clinical Triage Generation Function:
 * Integrates Gemini API / OpenAI API with fallback to Medical NLP Triage Parser.
 */
export async function generateClinicalTriage({ query, history = [], userRole = "patient" }) {
  const trimmedQuery = String(query || "").trim();

  if (!trimmedQuery) {
    throw new Error("Query is required for clinical triage.");
  }

  const geminiClient = getGeminiClient();

  // Try Google Gemini API if GEMINI_API_KEY is configured
  if (geminiClient) {
    const historyContext = history
      .slice(-4)
      .map((h) => `${h.sender === "user" ? "Patient" : "Care Guide"}: ${h.text || h.content}`)
      .join("\n");

    const systemPrompt = `You are a clinical triage assistant for MEDIrxCARE. Provide structured, preliminary guidance (non-definitive medical advice). Always format output into JSON with two keys:
1. 'reply': A clear, empathetic, clinical explanation, self-care suggestions, and red-flag emergency symptoms.
2. 'carePlan': { 'specialist': string, 'urgency': 'Low' | 'Moderate' | 'High', 'suggestedTests': string[], 'recommendedActions': string[] }`;

    const promptContents = historyContext
      ? `Previous Conversation Context:\n${historyContext}\n\nCurrent Patient Query:\n${trimmedQuery}`
      : `Patient Query:\n${trimmedQuery}`;

    // Candidate flash models: Primary is gemini-2.5-flash as requested, with automatic fallback if deprecated/high demand
    const candidateModels = [
      process.env.GEMINI_MODEL || "gemini-2.5-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.7-flash",
      "gemini-3.6-flash",
    ];

    let lastGeminiError = null;

    for (const model of candidateModels) {
      try {
        const response = await geminiClient.models.generateContent({
          model,
          contents: promptContents,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseJsonSchema: {
              type: Type.OBJECT,
              properties: {
                reply: {
                  type: Type.STRING,
                  description:
                    "A clear, empathetic, clinical explanation, self-care suggestions, and red-flag emergency symptoms.",
                },
                carePlan: {
                  type: Type.OBJECT,
                  properties: {
                    specialist: { type: Type.STRING, description: "Recommended medical specialty" },
                    urgency: { type: Type.STRING, enum: ["Low", "Moderate", "High"] },
                    suggestedTests: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "List of recommended diagnostic lab tests or scans",
                    },
                    recommendedActions: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Actionable next steps",
                    },
                    medicines: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          purpose: { type: Type.STRING },
                          caution: { type: Type.STRING },
                        },
                      },
                    },
                    selfCare: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    urgentWarning: { type: Type.STRING },
                  },
                  required: ["specialist", "urgency", "suggestedTests", "recommendedActions"],
                },
              },
              required: ["reply", "carePlan"],
            },
          },
        });

        const responseText = response.text?.trim?.() || "";
        const parsed = JSON.parse(responseText);

        if (parsed.reply && parsed.carePlan) {
          const carePlan = {
            specialist: normalizeSpecialist(parsed.carePlan.specialist),
            urgency: parsed.carePlan.urgency || "Moderate",
            suggestedTests: Array.isArray(parsed.carePlan.suggestedTests) ? parsed.carePlan.suggestedTests : [],
            recommendedActions: Array.isArray(parsed.carePlan.recommendedActions) ? parsed.carePlan.recommendedActions : [],
            medicines: Array.isArray(parsed.carePlan.medicines) ? parsed.carePlan.medicines : [],
            selfCare: Array.isArray(parsed.carePlan.selfCare) ? parsed.carePlan.selfCare : [],
            urgentWarning:
              parsed.carePlan.urgentWarning ||
              (parsed.carePlan.urgency === "High"
                ? "Seek immediate emergency medical evaluation (call 108 / 112) or go to the nearest emergency department."
                : "Seek prompt clinical consultation if symptoms worsen or do not improve within 24-48 hours."),
          };

          return {
            reply: parsed.reply,
            carePlan,
            provider: "gemini",
            model,
            // Backward compatibility
            specialist: carePlan.specialist,
            urgency: carePlan.urgency,
            suggestedTests: carePlan.suggestedTests,
            recommendedActions: carePlan.recommendedActions,
            response: parsed.reply,
            medicines: carePlan.medicines,
            selfCare: carePlan.selfCare,
            urgentWarning: carePlan.urgentWarning,
            summary: carePlan.recommendedActions?.[0] || parsed.reply.slice(0, 100),
          };
        }
      } catch (geminiError) {
        lastGeminiError = geminiError;
        console.warn(`Gemini triage with ${model} failed (${geminiError.message?.slice(0, 100)}), trying fallback...`);
      }
    }

    console.warn("All Gemini flash models failed, falling back to next provider.", lastGeminiError?.message);
  }

  // Try OpenAI API if OPENAI_API_KEY is configured
  const openAiClient = getOpenAiClient();
  if (openAiClient) {
    try {
      const historyContext = history
        .slice(-4)
        .map((h) => `${h.sender === "user" ? "Patient" : "Care Guide"}: ${h.text || h.content}`)
        .join("\n");

      const response = await openAiClient.chat.completions.create({
        model: env.openAiModel || "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a clinical triage assistant for MEDIrxCARE. Provide structured, preliminary guidance (non-definitive medical advice). Always format output into JSON with two keys: 'reply' (markdown text) and 'carePlan' ({ 'specialist': string, 'urgency': 'Low' | 'Moderate' | 'High', 'suggestedTests': string[], 'recommendedActions': string[] }).",
          },
          {
            role: "user",
            content: `History:\n${historyContext}\n\nPatient Query:\n${trimmedQuery}`,
          },
        ],
      });

      const parsed = JSON.parse(response.choices[0].message.content);
      if (parsed.reply && parsed.carePlan) {
        const carePlan = {
          specialist: parsed.carePlan.specialist || "General Physician",
          urgency: parsed.carePlan.urgency || "Moderate",
          suggestedTests: Array.isArray(parsed.carePlan.suggestedTests) ? parsed.carePlan.suggestedTests : [],
          recommendedActions: Array.isArray(parsed.carePlan.recommendedActions) ? parsed.carePlan.recommendedActions : [],
          medicines: Array.isArray(parsed.carePlan.medicines) ? parsed.carePlan.medicines : [],
          selfCare: Array.isArray(parsed.carePlan.selfCare) ? parsed.carePlan.selfCare : [],
          urgentWarning: parsed.carePlan.urgentWarning || "",
        };

        return {
          reply: parsed.reply,
          carePlan,
          provider: "openai",
          model: env.openAiModel || "gpt-4o-mini",
          specialist: carePlan.specialist,
          urgency: carePlan.urgency,
          suggestedTests: carePlan.suggestedTests,
          recommendedActions: carePlan.recommendedActions,
          response: parsed.reply,
          medicines: carePlan.medicines,
          selfCare: carePlan.selfCare,
          urgentWarning: carePlan.urgentWarning,
          summary: carePlan.recommendedActions?.[0] || parsed.reply.slice(0, 100),
        };
      }
    } catch (openAiError) {
      console.warn("OpenAI clinical triage request failed, falling back to medical NLP engine.", openAiError.message);
    }
  }

  // Fallback to Dynamic Rule-Based Medical NLP Triage Parser
  const fallbackResult = executeMedicalNlpTriage(trimmedQuery, history);
  return {
    ...fallbackResult,
    provider: "clinical-nlp-engine",
    warning: !process.env.GEMINI_API_KEY
      ? "GEMINI_API_KEY is not configured in backend environment. Fallback clinical NLP triage active."
      : "Gemini API unavailable or invalid key. Fallback clinical NLP triage active.",
  };
}

export async function generateAiDoctorAssessment(issue) {
  return generateClinicalTriage({ query: issue });
}

export async function generateChatbotReply({ message, history = [], role = "patient" }) {
  const result = await generateClinicalTriage({ query: message, history, userRole: role });
  return result.reply || result.response;
}
