const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    status:{type :String ,default:"offline"},
    lastSeen:{type:Date ,default:null}
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);