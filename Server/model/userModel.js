const { Schema,model} = require("mongoose");

const MySchema = new Schema({
  enrollmentNumber:{
    type:Number
  },
  name: {
    type: String,
  },
  Age: {
    type: Number,
  },
  Email: {
    type: String,
  },
  Gender: {
    type: String,
  },
  Course: {
    type: String,
  },
  password: {
    type: String, 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TaskModel = model("test", MySchema)

module.exports = TaskModel