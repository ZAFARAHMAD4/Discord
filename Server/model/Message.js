const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chatId: { type: String, required: true }, // unique id of from+to
  sender: { type: String, required: true }, // who sent (user email or id)
  message: { type: String },
  file: {
    name: { type: String, default: "" },
    type: { type: String, default: "" },
    content: { type: String, default: "" }, // base64 or url
  },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);
