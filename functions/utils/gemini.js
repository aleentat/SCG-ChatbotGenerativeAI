const { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const context = require("./context");
const fs = require('fs').promises;

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  }
];

class Gemini {
  async chat(cacheChatHistory, prompt) {
    const readdata = await readCareerList();
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const chatHistory = [
      {
        role: "user",
        parts: [{ text: "I want to ask about the SCG's available positions" }]
      },
      {
        role: "model",
        parts: [{ text: "Answer only questions related to the SCG career. The answers should reference the event information from the TXT: title, location, employment type, job functions, responsibilities and qualifications\n" + readdata }]
      }
    ];
    const chat = model.startChat({ history: chatHistory });
    try {
      const result = await chat.sendMessage(prompt, safetySettings);
      const quickReplyPayload = {
        "type": "text",
        "text": result.response.text(),
        "quickReply": {
          "items": [
            {
              "type": "action",
              "imageUrl": "https://cdn-icons-png.flaticon.com/128/1357/1357102.png",
              "action": {
                "type": "message",
                "label": "Job Recommendation",
                "text": "Can you recommend me a job?"
              }
            },
            {
              "type": "action",
              "imageUrl": "https://cdn-icons-png.flaticon.com/128/3850/3850285.png",
              "action": {
                "type": "message",
                "label": "Search by Type",
                "text": "Tell me all the job types."
              }
            },
            {
              "type": "action",
              "imageUrl": "https://cdn-icons-png.flaticon.com/128/3435/3435091.png",
              "action": {
                "type": "message",
                "label": "Search by Location",
                "text": "I am searching for a job near my location."
              }
            },
            {
              "type": "action",
              "imageUrl": "https://cdn-icons-png.flaticon.com/128/9194/9194840.png",
              "action": {
                "type": "message",
                "label": "Contact",
                "text": "Tell me the contact information."
              }
            },
            {
              "type": "action",
              "action": {
                "type": "location",
                "label": "Send location"
              }
            },
            {
              "type": "action",
              "imageUrl": "https://cdn-icons-png.flaticon.com/128/3652/3652267.png",
              "action": {
                "type": "datetimepicker",
                "label": "Appointment",
                "data": "storeId=12345",
                "mode": "datetime",
                "initial": "2024-07-15T00:00",
                "max": "2024-12-31T23:59",
                "min": "2024-07-01T00:00"
              }
            }
          ]
        }
      };
      console.log(result.response.text());
      return quickReplyPayload;
    } catch (error) {
      console.error("Error during chat:", error);
      return {
        "type": "text",
        "text": "There seems to be a temporary issue. Please try again later."
      };
    }
  }
}

async function readCareerList() {
  try {
    const data = await fs.readFile(context.careerlist_txt, 'utf8');
    return data;
  } catch (err) {
    console.error('Error reading file:', err);
  }
}

module.exports = new Gemini();