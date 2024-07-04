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
    if (cacheChatHistory.length > 0) {
      chatHistory.push(...cacheChatHistory);
    }
    console.log(JSON.stringify(chatHistory));
    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(prompt, safetySettings);
    console.log(result.response.text());
    return result.response.text();
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