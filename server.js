require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS Middleware (Fix)
app.use(cors({
    origin: "https://multispeciality-hospital-eight.vercel.app",
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type"
}));

// Middleware
app.use(express.json());
app.use(bodyParser.json());

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Define Schema and Model
const ContactSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    date: { type: Date, default: Date.now }
});

const Contact = mongoose.model("Contact", ContactSchema);

// ✅ Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ✅ Test Route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// ✅ Handle Contact Form Submission
app.post("/contact", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Save to Database
        const newContact = new Contact({ name, email, message });
        await newContact.save();

        // Send Confirmation Email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Thank You for Contacting Us",
            text: `Dear ${name},\n\nThank you for reaching out! We have received your message and will get back to you soon.\n\nBest Regards,\nMultispeciality Health Care Platform`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Message received. Thank you email sent!" });
    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// ✅ Correctly Export App for Vercel
module.exports = app;
