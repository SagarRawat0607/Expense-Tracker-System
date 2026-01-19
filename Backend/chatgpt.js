// chatgpt.js
const OpenAI = require("openai");
require("dotenv").config();

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5001",
    "X-Title": "MedicBot",
  },
});

// Safe JSON extractor
function extractJSON(text) {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}") + 1;
    return JSON.parse(text.slice(start, end));
  } catch (err) {
    console.error("JSON parse error:", err);
    return {
      precautions: [],
      medicines: [],
      warning:
        "Please describe your symptoms clearly. Consult a doctor if serious.",
    };
  }
}

async function askChatGPT(userMessage) {
  try {
    const response = await client.chat.completions.create({
      model: "mistralai/mistral-7b-instruct",
      messages: [
        {
          role: "system",
          content: `
            You are MedAI, a general-purpose health guidance chatbot.

            ROLE:
            - Provide general health precautions and commonly known OTC medicine names
            - Work for ALL kinds of health-related user inputs
            - Do NOT diagnose diseases
            - Do NOT give dosage, prescriptions, or emergency decisions

            OUTPUT RULES (STRICT):
            - Respond ONLY in valid JSON
            - Do NOT include markdown
            - Do NOT add explanations outside JSON

            RESPONSE FORMAT (MANDATORY):
            {
              "precautions": [string],
              "medicines": [string],
              "warning": string
            }

            CONTENT GUIDELINES:
            - Precautions must be practical daily actions (rest, hydration, avoidance, hygiene, posture, diet)
            - Medicines must be commonly known OTC names (no dosage, no brands)
            - Warning must be ONE short sentence

            BEHAVIOR LOGIC:
            - If input is a greeting → ask user to describe symptoms in "warning"
            - If input is unclear or non-medical → ask for health-related details
            - If symptoms are mild → give helpful precautions and medicines
            - If symptoms seem persistent, severe, or unusual → advise consulting a doctor

            SAFETY:
            - Never claim certainty
            - Never say "this will cure"
            - Never provide diagnosis

            EXAMPLES:

            User: stomach pain and nausea
            Response:
            {
              "precautions": [
                "Eat light and easily digestible food",
                "Avoid oily or spicy meals",
                "Drink small sips of water frequently"
              ],
              "medicines": [
                "Antacid",
                "ORS"
              ],
              "warning": "Consult a doctor if pain or vomiting persists."
            }

            User: anxiety and sleeplessness
            Response:
            {
              "precautions": [
                "Practice deep breathing or relaxation exercises",
                "Avoid caffeine before bedtime",
                "Maintain a regular sleep schedule"
              ],
              "medicines": [
                "Herbal calming supplements"
              ],
              "warning": "Seek professional help if symptoms interfere with daily life."
            }`,
        },
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const dangerWords = [
      "chest pain",
      "breathing difficulty",
      "unconscious",
      "bleeding",
    ];

    if (dangerWords.some((w) => userMessage.toLowerCase().includes(w))) {
      return {
        precautions: [],
        medicines: [],
        warning:
          "This may require urgent medical attention. Please seek immediate help.",
      };
    }

    const raw = response.choices[0].message.content;
    console.log("RAW AI RESPONSE:", raw); // 🔥 DEBUG LOG

    return extractJSON(raw);
  } catch (err) {
    console.error("OPENROUTER ERROR:", err);
    return {
      precautions: [],
      medicines: [],
      warning: "Unable to generate response. Please consult a doctor.",
    };
  }
}

module.exports = askChatGPT;
