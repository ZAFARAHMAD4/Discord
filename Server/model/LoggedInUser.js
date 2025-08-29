const mongoose = require('mongoose');

const LoggedInUserSchema = new mongoose.Schema({
  enrollmentNumber: { type: String, required: true },
  name: { type: String },
  password: { type: String },
  age: { type: Number },
  gender: { type: String },
  course: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600
  }
});

module.exports = mongoose.model('LoggedInUser', LoggedInUserSchema);
