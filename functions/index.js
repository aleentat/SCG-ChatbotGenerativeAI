const { onRequest } = require("firebase-functions/v2/https");
const line = require("./utils/line");
const gemini = require("./utils/gemini");

const NodeCache = require("node-cache");
const cache = new NodeCache();
const CACHE_CHAT = "chat_";

exports.test = onRequest((req, res) => {
    res.send("Hello from Firebase!");
})

exports.webhook = onRequest(async (req, res) => {
    const events = req.body.events;
    for (const event of events) {
        const userId = event.source.userId;
        console.log("userId: ", userId);

        switch (event.type) {
            case "message":
                if (event.message.type === "text") {
                    const prompt = event.message.text;
                    console.log("prompt: ", prompt);

                    /* multi-turn conversations */
                    // Get a cache chat history
                    let chatHistory = cache.get(CACHE_CHAT + userId);
                    // Check available cache
                    if (!chatHistory) {
                        chatHistory = [];
                    }
                    // Send a prompt to Gemini
                    const responsePayload = await gemini.chat(chatHistory, prompt);
                    // Reply with the generated text and quick reply options
                    await line.reply(event.replyToken, [responsePayload]);
                    // Push a new chat history
                    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
                    // Set a cache chat history
                    cache.set(CACHE_CHAT + userId, chatHistory, 300);
                    break;
                }
                break;
        }
    }
    res.end();
});