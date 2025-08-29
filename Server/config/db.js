const mongoose = require('mongoose');
//mongodb+srv://zafarahmad:2a2q8mOQuvJg44ll@cluster0.zffii.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
require("dotenv").config();
// mongodb://localhost:27017/test1
// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.DB_URL);
//     console.log(`MongoDB Connected: {conn.connection.host}`);
//   } catch (error) {
//     console.error(error.message);
//     process.exit(1);
//   }
// }

// module.exports = connectDB;
const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb://localhost:27017/test1");
    console.log(`MongoDB Connected: {conn.connection.host}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = connectDB;