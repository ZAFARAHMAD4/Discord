const express=require("express")
const router=express.Router()
const User=require("../model/User")


// Discord 

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("📩 Incoming body:", req.body); // 👈 Debug step

    const newUser = new User({ name, email, password });
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
    const { name, email, password } = req.body;

    // // basic validation
    // if (!enrollmentNumber || !email || !password) {
    //   return res.status(400).json({ error: "All fields are required" });
    // }
    console.log(name, email, password)

    // check if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "User already exists" });
    }

    // save new user
    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
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

// 🔹 Forget Password API
router.post("/forgot-password", async (req, res) => {
  try {
    const { email, name, newPassword, confirmPassword } = req.body;

    // Basic validation
    if (!email || !name || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // User find
    const user = await User.findOne({ email, name });
    if (!user) {
      return res.status(404).json({ message: "User not found with this Email and Name" });
    }

    // Update password (plain, agar hashing chahiye to bcrypt use karna)
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports=router 