const { Schema, model, models } = require("mongoose");

const paperSchema = new Schema({
  title:{
      type:String
},
  noofques: {
    type: Number,
  },
  paperID: {
    type: Number,
    unique: true, // critical!
  },
 
  course: {
    type: String,
  },
 
  timelimit: {
    type: Number,
  },
 
  Totalmarks: {
    type: Number,
  },
 
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const paperModel = models.Paper || model('Paper', paperSchema);

module.exports = paperModel;
