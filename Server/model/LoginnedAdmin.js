const mongoose = require('mongoose');

const LoggedInAdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  gender: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Document auto-deletes after 1 hour
  },
});

module.exports = mongoose.model('LoggedInAdmin', LoggedInAdminSchema);
