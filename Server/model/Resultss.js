const { Schema, model } = require("mongoose");

const Resultschema = new Schema({
  enrollmentNumber: { type: String }, // No 'required' or 'unique' here
  papertitless: { type: String },
  paperidsss: { type: String},
  totalMarks: { type: Number },
  grade: { type: String },
  percentage: { type: Number},
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Resultmodel = model("Resultss", Resultschema);

module.exports = Resultmodel;
