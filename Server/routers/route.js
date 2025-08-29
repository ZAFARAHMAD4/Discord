// Importing express module
const express=require("express")
const router=express.Router()
// const Users = require("../model/userModel2")
const User3=require("../model/userModel3")
const User=require("../model/User")
// const Resultmodel=require("../model/Resultss")
// const nodemailer = require("nodemailer");
// const paperModel=require("../model/AllQuestion")
// const bcrypt = require('bcryptjs');
// const Questions = require('../model/Quespaper');
// const LoggedInUser = require('../model/LoggedInUser');
// const Admin = require('../model/Admin');
// const LoggedInAdmin=require('../model/LoginnedAdmin')
// const PostAd = require("../model/PostAd");


router.get("/home", (req,res)=>{
    res.send("This is the homepage request")
})


router.post('/admins', async (req, res) => {
  const { NAME, Email, GENDER, PASSWORD } = req.body;

  try {
    const existing = await Admin.findOne({ email: Email });
    if (existing) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const newAdmin = new Admin({
      fullName: NAME,
      email: Email,
      gender: GENDER,
      password: PASSWORD, // You can add hashing later with bcrypt
    });

    await newAdmin.save();
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (err) {
    console.error('Error saving admin:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// Admin Login Route
router.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (!admin || admin.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.status(200).json({ success: true, user: admin });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get admin details by email
// Corrected GET route to return all admins
// ✅ This route fetches ALL admins
router.get('/admins', async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json({ success: true, admins });
  } catch (err) {
    console.error('Error fetching admins:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post("/resetpass", async (req, res) => {
  const { enrollmentNumber, email, newPassword } = req.body;
  const user = await User3.findOne({ enrollmentNumber });
  console.log(user);
  
  if (!user) {
    return res.status(404).json({ success: false, message: "Admin not found" });
  }

  user.PASSWORD = newPassword; // Remember to hash in production
  await user.save();

  res.json({ success: true, message: "Password reset successful" });
});


router.post("/results", async (req, res) => {
  const { enrollmentNumber, papertitless, paperidsss, totalMarks, grade, percentage } = req.body;

  if (!enrollmentNumber || !papertitless || !paperidsss || !totalMarks || !grade || !percentage) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newResult = new Resultmodel({
      enrollmentNumber,
      papertitless,
      paperidsss,
      totalMarks,
      grade,
      percentage,
    });

    await newResult.save();
    return res.status(201).json({ message: "Result created successfully", result: newResult });
  } catch (error) {
    console.error("Error creating result:", error);
    return res.status(500).json({ error: "Failed to create result", details: error.message });
  }
});





// lenght of number of student
router.get('/exam-count', async (req, res) => {
  try {
    const count = await User3.countDocuments();
    res.json({ examcount: count });
  } catch (error) {
    res.status(500).send('Error fetching count');
  }
});
router.get('/test-count', async (req, res) => {
  try {
    const count1 = await paperModel.countDocuments();
    res.json({ examcount1: count1 });
  } catch (error) {
    res.status(500).send('Error fetching count');
  }
});
router.get('/Admintable', async (req, res) => {
  try {
    const count1 = await paperModel.countDocuments();
    const papers = await paperModel.find();
    // Log each paper's details to the console
    papers.forEach(paper => {
      console.log('Paper:', {
        title: paper.title,
        noofques: paper.noofques,
        paperID: paper.paperID,
        course: paper.course,
        timelimit: paper.timelimit,
        Totalmarks: paper.Totalmarks,
        createdAt: paper.createdAt,
      });
    });
    res.json({papers, examcount1: count1 });
  } catch (error) {
    res.status(500).send('Error fetching count');
  }
});
// router.get('/results', async (req, res) => {
//   try {
//     const count2 = await Resultmodel.countDocuments();
//     const papers = await Resultmodel.find();
//     res.json({ papers, examcount1: count2 });
//   } catch (error) {
//     res.status(500).send('Error fetching count');
//   }
// });
router.get('/logineduser', async (req, res) => {
  try {
    const count3 = await User3.countDocuments(); // Get the count of documents
    const papers3 = await User3.find(); // Find all the documents in User3 collection

    // Send the response with data
    res.json({ papers: papers3, examcount1: count3 });
  } catch (error) {
    // Log the actual error for debugging purposes
    console.error('Error fetching data:', error);

    // Send an appropriate error message
    res.status(500).send('Error fetching count and papers');
  }
});
router.post("/loginedusercurrent", async (req, res) => {
  try {
    const { enrollmentnumber, name, gender, age, course, password } = req.body;

    if (!enrollmentnumber || !name || !gender || !age || !course || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newUser = new LoggedInUser({
      enrollmentNumber: enrollmentnumber,
      name: name,
      gender: gender,
      age: age,
      course: course,
      password: password,
    });

    // Save the new user in the database
    const savedUser = await newUser.save();
    return res.status(201).json({ message: "User saved successfully", data: savedUser });
  } catch (error) {
    console.error("Error saving user:", error);
    return res.status(500).json({ error: "Failed to save user" });
  }
});
router.get("/loginedusercurrent", async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await LoggedInUser.find();

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    return res.status(200).json({ message: "Users fetched successfully", users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});



// adminloginedcurrent
router.post('/logineduAdmincurrent', async (req, res) => {
  try {
    const { name, gender, email, password } = req.body;

    if (!name || !gender || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const admin = new LoggedInAdmin({ name, gender, email, password });
    await admin.save();

    res.status(200).json({ message: 'Admin saved', admin });
  } catch (err) {
    console.error("Backend error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/logineduAdmincurrent", async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await LoggedInAdmin.find();

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    return res.status(200).json({ message: "Users fetched successfully", users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});
router.delete("/logineduAdmincurrent", async (req, res) => {
  try {
    const result = await LoggedInAdmin.deleteMany({});
    return res.status(200).json({ message: "All logined users deleted", result });
  } catch (error) {
    console.error("Error deleting all users:", error);
    return res.status(500).json({ error: "Failed to delete logined users" });
  }
});

// DELETE all logged in users
router.delete("/loginedusercurrent", async (req, res) => {
  try {
    const result = await LoggedInUser.deleteMany({});
    return res.status(200).json({ message: "All logined users deleted", result });
  } catch (error) {
    console.error("Error deleting all users:", error);
    return res.status(500).json({ error: "Failed to delete logined users" });
  }
});


// ✅ ADD THIS: GET /api/results

router.get('/studentgiveexamrun/:paperID', async (req, res) => {
  try {
    const { paperID } = req.params; // Get paperID from the request params
    console.log(paperID)
    const questionfind = await Questions.find({ paperID: paperID }); // Find questions for the paper ID
  console.log(questionfind)
    res.json({ questionfind:questionfind });
  } catch (error) {
    res.status(500).send('Error fetching questions');
  }
});


router.post("/ques", async (req, res) => {
  const { title, noofques,paperID, course, timelimit, Totalmarks, questions } = req.body;
  console.log(title, 'myques');
  
  // Validate that `questions` is an array
  if (!Array.isArray(questions)) {
    return res.status(400).json({
      message: 'Invalid input: "questions" must be an array',
    });
  }

  try {
    // Step 1: Save the test paper first
    const insertpaper = new paperModel({ title, noofques,paperID, course, timelimit, Totalmarks });
    await insertpaper.save();
    
    // Step 2: Save all questions related to this test
    for (const question of questions) {
      const insertquestion = new Questions({
        paperID:question.paperID,
        questionText: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
      });
      await insertquestion.save();
    }

    // Step 3: Send a single response after everything is done
    res.status(201).json({
      message: 'Test and questions saved successfully!',
      test: {
        title,
        noofques,
        paperID,
        course,
        timelimit,
        Totalmarks,
      },
      questions: questions,
    });
  } catch (error) {
    // Log detailed error message to the console
    console.error('Error saving test and questions:', error.message);
    console.error(error);
    res.status(500).json({
      message: 'Error creating test and saving questions',
      error: error.message || 'Unknown error',
    });
  }
});

// DELETE route to delete paper and associated questions
// DELETE route: Delete paper by _id and also delete related questions using paperIDconst express = require('express');
router.delete("/ques/:id", async (req, res) => {
  const paperID = parseInt(req.params.id);
  console.log("Deleting paper with paperID:", paperID);

  try {
    const deletedPaper = await paperModel.findOneAndDelete({ paperID: paperID });

console.log(deletedPaper)
    if (!deletedPaper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    // delete from Questions
    await Questions.deleteMany({ paperID: { $in: [paperID] } });

    res.status(200).json({
      message: 'Paper and associated questions deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting paper and questions:', error.message);
    res.status(500).json({
      message: 'Error deleting paper and questions',
      error: error.message,
    });
  }
});



router.get('/getEnrollmentNumber', async (req, res) => {
  try {
    const userId = req.user._id; // Assume you're storing the logged-in user's data in `req.user`
    const user = await User3.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Send back the enrollment number
    res.status(200).json({
      success: true,
      enrollmentNumber: user.enrollmentNumber,
    });
  } catch (error) {
    console.error("Error fetching enrollment number:", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
});

// all result
router.get("/allresults", async (req, res) => {
  try {
    const results = await Resultmodel.find();  // Fetch all results from the database
    res.json(results);  // Send the results back as JSON
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});








// Login route




// In-memory storage (for simplicity; use a database in production)

//iktf cqvx fjcd qhbf
let otps = {};

// Generate random OTP
// const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 587,
//   secure: false, // Use true for port 465
//   auth: {
//     user: 'ansarizaf5@gmail.com',
//     pass: 'ibwfcejyiedhkqrd', // Replace with the app password
//   },
// });





router.post("/sendemail", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const otp = generateOTP();
  const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

  // Save OTP and expiry
  otps[email] = { otp, expiry };

  try {
    await transporter.sendMail({
      from: `"Zafar" <ansarizaf5@gmail.com>`,
  to: `${email}`,
  subject: "Your OTP Code",
  text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
     
    });
    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// API to verify OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  const data = otps[email];

  if (!data) {
    return res.status(400).json({ error: "Invalid email or OTP" });
  }

  const { otp: storedOtp, expiry } = data;

  if (Date.now() > expiry) {
    delete otps[email];
    return res.status(400).json({ error: "OTP has expired" });
  }

  if (storedOtp !== otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  delete otps[email];
  res.status(200).json({ message: "OTP verified successfully!" });
});
router.post("/sendemail", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const otp = generateOTP();
  const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

  // Save OTP and expiry
  otps[email] = { otp, expiry };

  try {
    await transporter.sendMail({
      from: `"Zafar" <ansarizaf5@gmail.com>`,
  to: `${email}`,
  subject: "Your OTP Code",
  text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
     
    });
    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// API to verify OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  const data = otps[email];

  if (!data) {
    return res.status(400).json({ error: "Invalid email or OTP" });
  }

  const { otp: storedOtp, expiry } = data;

  if (Date.now() > expiry) {
    delete otps[email];
    return res.status(400).json({ error: "OTP has expired" });
  }

  if (storedOtp !== otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  delete otps[email];
  res.status(200).json({ message: "OTP verified successfully!" });
});







router.post("/sendemail1", async (req, res) => {
  const { Email, NAME, AGE, GENDER, COURSE, PASSWORD } = req.body;

  // Log all received fields
  // console.log("Received Enrollment Number:", enrollmentNumber);
  console.log("Received Name:", NAME);
  console.log("Received Age:", AGE);
  console.log("Received Email:", Email);
  console.log("Received Gender:", GENDER);
  console.log("Received Course:", COURSE);
  console.log("Received Password:", PASSWORD);

  // Validate all required fields
  if (!Email || !NAME || !AGE || !GENDER || !COURSE || !PASSWORD) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Generate OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const expiry = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes

  // Save OTP and expiry (assuming you have an in-memory object or database)
  otps[Email] = { otp, expiry };

  try {
    // Send OTP via email
    await transporter.sendMail({
      from: `"Your App" <your_email@gmail.com>`,
      to: Email,
      subject: "Your OTP Code",
      text: `Hello ${NAME},\n\nYour OTP is ${otp}. It is valid for 5 minutes.\n\nThank you for registering!`,
    });

    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    res.status(500).json({ error: "Failed to send OTP email." });
  }
});


router.post("/sendemail12", async (req, res) => {
  const { Email, NAME, GENDER, PASSWORD } = req.body;

  // Log all received fields
  // console.log("Received Enrollment Number:", enrollmentNumber);
  console.log("Received Name:", NAME);
  console.log("Received Email:", Email);
  console.log("Received Gender:", GENDER);
  console.log("Received Password:", PASSWORD);

  // Validate all required fields
  if (!Email || !NAME || !GENDER  || !PASSWORD) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Generate OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const expiry = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes

  // Save OTP and expiry (assuming you have an in-memory object or database)
  otps[Email] = { otp, expiry };

  try {
    // Send OTP via email
    await transporter.sendMail({
      from: `"Your App" <your_email@gmail.com>`,
      to: Email,
      subject: "Your OTP Code",
      text: `Hello ${NAME},\n\nYour OTP is ${otp}. It is valid for 5 minutes.\n\nThank you for registering!`,
    });

    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    res.status(500).json({ error: "Failed to send OTP email." });
  }
});



router.post("/store", async (req, res) => {
  // const {name, email, password} = req.body;
  const {  enrollmentNumber, NAME, Email,AGE, GENDER, COURSE, PASSWORD } = req.body;

     
//   res.send("This is the homepage request2",req.body)
  const newUsers1 = new User3({enrollmentNumber, NAME, Email,AGE, GENDER, COURSE, PASSWORD })
    await newUsers1.save();
    res.status(201).json({ message: 'User registered successfully!', user: {enrollmentNumber, NAME, Email,AGE, GENDER, COURSE, PASSWORD }});
    try {
      // Send OTP via email
      await transporter.sendMail({
        from: `"Your App" <ANSARIZAF5@gmail.com>`,
        to: Email,
        subject: "Your OTP Code",
        text: `Hello ${NAME},\n\nYour Enrollment number is ${enrollmentNumber}\nYour Password is ${PASSWORD}\nYour Name is ${NAME}\nYour Email ID is ${Email}\nYour AGE is ${AGE}\nYour GENDER is ${GENDER}\nYour COURSE is ${COURSE}. It is valid for 5 minutes.\n\nThank you for registering!`,
      });
  
      // alert('yes');
      res.status(200).json({ message: "OTP sent successfully!" });
    } catch (error) {
      console.error("Error sending OTP email:", error);
      res.status(500).json({ error: "Failed to send OTP email." });
    }
});
router.get('/test2', async (req, res) => {
  try {
    const students = await User3.find(); // Find all students from the database
    res.status(200).json({ studentss: students }); // Send the students in the response
  } catch (error) {
    res.status(500).json({ error: 'Error fetching students' });
  }
});

router.post('/homes', async (req, res) => {
  const { enrollmentNumber, password } = req.body;

  try {
    // Find the user based on the enrollment number
    const user = await User.findOne({ enrollmentNumber });
    console.log(user);
    

    if (!user) {
      return res.status(404).json({ success: false, message: "No record found" });
    }

    // Check if the password matches
    if (user.password === password.toString()) {
  return res.status(200).json({
    success: true,
    message: "Login successful",
    user: user,  // Send the full user object
  });
}

 else {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

  } catch (error) {
    // Handle any server-side errors
    console.error('Error during login:', error);
    return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
  }
  
});
router.get('/userdetails', async (req, res) => {
  const { enrollmentNumber } = req.query; // Fetch the enrollment number from query params

  try {
    // Find the user based on the enrollment number
    const userdetail = await User3.findOne({ enrollmentNumber });

    // Return a successful response with user details
    if (userdetail) {
      return res.status(200).json({ success: true, data: userdetail });
    } else {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    // Handle any server-side errors
    console.error('Error fetching user details:', error);
    return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
  }
});
router.post("/post-ad", async (req, res) => {
  try {
    const newAd = new PostAd(req.body);
    const savedAd = await newAd.save();
    res.status(201).json({ success: true, data: savedAd });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



// Discord 

router.post("/signup", async (req, res) => {
  try {
    const { name, enrollmentNumber, email, password } = req.body;

    console.log("📩 Incoming body:", req.body); // 👈 Debug step

    const newUser = new User({ name, enrollmentNumber, email, password });
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully!",
      user: newUser, // 👈 ab actual DB se saved user return karo
    });
  } catch (err) {
    console.error("Error saving user:", err);
    res.status(500).json({ error: "Failed to register user" });
  }
});




router.post("/users/signup", async (req, res) => {
  try {
    const { name, enrollmentNumber, email, password } = req.body;

    // // basic validation
    // if (!enrollmentNumber || !email || !password) {
    //   return res.status(400).json({ error: "All fields are required" });
    // }

    // check if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "User already exists" });
    }

    // save new user
    const user = new User({ name, enrollmentNumber, email, password });
    await user.save();

    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { enrollmentNumber, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ enrollmentNumber });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Compare passwords (❌ Not secure if plain text is stored)
    if (user.password !== password) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    res.status(200).json({ message: "User login successful", user });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find(); // MongoDB se saare users fetch karo
    res.status(200).json({ users }); // Response as { users: [...] }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports=router 