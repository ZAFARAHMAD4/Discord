const nodemailer = require("nodemailer");
const express=require("express")
const router=express.Router()
const newOtp = Math.floor(1000 + Math.random() * 9000).toString(); // Generate a 4-digit number

const sendMail=async(req,res)=>{
      const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for port 465, false for other ports
            auth: {
              user: "ansarizaf5@gmail.com",
              pass: "ibwfcejyiedhkqrd",
            },
          });
          async function main() {
            // send mail with defined transport object
            const info = await transporter.sendMail({
              from: '"CODES WARS 👻" <ansarizaf5@gmail.com>', // sender address
              to:"za897192@gmail.com" , // list of receivers
              subject: "Hello ✔", // Subject line
              text: `new otp ${newOtp}`, // plain text body
              html: "<b>Hello zafar?</b>", // html body
            });
          
            console.log("Message sent: %s", info.messageId);
            // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
            res.json(info)
          }
          
          main().catch(console.error);
}
module.exports=sendMail;