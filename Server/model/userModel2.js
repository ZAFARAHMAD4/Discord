const { Schema,model} = require("mongoose");

const MySchema1 = new Schema({
  name: {
    type: String,
  },
  email: {
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

const TaskModel1 = model("tests", MySchema1)

module.exports = TaskModel1