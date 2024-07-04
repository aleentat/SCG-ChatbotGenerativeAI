const axios = require("axios");

const LINE_HEADER = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`
};

class LINE {
  reply(token, payload) {
    return axios({
      method: "post",
      url: "https://api.line.me/v2/bot/message/reply",
      headers: LINE_HEADER,
      data: { replyToken: token, messages: payload }
    });
  }
};

module.exports = new LINE();