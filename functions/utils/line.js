const axios = require("axios");

const LINE_HEADER = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`
};

class LINE {
  async reply(token, payload) {
    try {
      const response = await axios({
        method: "post",
        url: "https://api.line.me/v2/bot/message/reply",
        headers: LINE_HEADER,
        data: { replyToken: token, messages: payload }
      });
      return response.data;
    } catch (error) {
      console.error("Error in LINE reply:", error.response ? error.response.data : error.message);
      throw error;
    }
  }
};

module.exports = new LINE();