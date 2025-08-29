const { Schema,model} = require("mongoose");

const MySchema2 = new Schema({
enrollmentNumber:{
      type:Number
},
  NAME: {
    type: String,
  },
 
  AGE: {
    type: Number,
  },
 
  GENDER: {
    type: String,
  },
 
  COURSE: {
    type: String,
  },
 
  PASSWORD: {
    type: String,
  },
  Email: {
    type: String,
  },
 
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TaskModel2 = model("tests2", MySchema2)

module.exports = TaskModel2