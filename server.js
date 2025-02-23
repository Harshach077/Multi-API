const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.log("MongoDB Connection Error:", err));

// Define Schema and Model
const ContactSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    date: { type: Date, default: Date.now }
});

const Contact = mongoose.model("Contact", ContactSchema);

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Handle Contact Form Submission
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
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
