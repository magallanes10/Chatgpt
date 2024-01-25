module.exports.config = {
  name: "shoti",
  version: "1.0.0",
  credits: "shoti-api",
  description: "Generate random tiktok girl videos",
  usePrefix: false,
  hasPermssion: 0,
  commandCategory: "other",
  usage: "[shoti]",
  cooldowns: 50,
  dependencies: [],
  usePrefix: true,
};

module.exports.run = async function ({ api, event }) {
  try {
   api.sendMessage("⏱️ | Sending Shoti Please Wait...", event.threadID, event.messageID);
    const axios = require("axios");
    const request = require("request");
    const fs = require("fs");
    let response = await axios.post(
      "https://your-shoti-api.vercel.app/api/v1/get",
      {
        apikey: "$shoti-1hkmd898q2jnpln4l48",
      },
    );
    var file = fs.createWriteStream(__dirname + "/cache/shoti.mp4");
    var rqs = request(encodeURI(response.data.data.url));
    rqs.pipe(file);
    file.on("finish", () => {
      return api.sendMessage(
        {
          body: `Tiktok Username:\n@${response.data.data.user.username}`,
          attachment: fs.createReadStream(__dirname + "/cache/shoti.mp4"),
        },
        event.threadID,
        event.messageID,
      );
    });
    file.on("error", (err) => {
      api.sendMessage(`Shoti Error: ${err}`, event.threadID, event.messageID);
    });
  } catch (error) {
    api.sendMessage(
      "An error occurred while generating video:" + error,
      event.threadID,
      event.messageID,
    );
  }
};
