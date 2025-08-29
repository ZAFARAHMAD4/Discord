const express=require("express")
const router=express.Router()
const User=require("../model/User")


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