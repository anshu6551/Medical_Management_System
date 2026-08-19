const User = require("../models/UserModels");
const Clinic = require("../models/ClinicModel")
const httpStatusCode = require("../utils/httpStatusCode");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const emailService = require("../utils/emailService");

class AuthController {
  // 1. REGISTER USER
  async register(req, res) {
    try {
      let { name, email, password, role, phone } = req.body;

      if (!name || !email || !password) {
        return res.status(httpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Name, email, and password are required",
        });
      }

      email = email.toLowerCase().trim();

      const userExist = await User.findOne({ email });
      if (userExist) {
        return res.status(httpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "User already registered with this email",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const rawVerificationToken = crypto.randomBytes(32).toString("hex");
      const tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;

      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || "PATIENT",
        phone,
        isVerified: false,
        verificationToken: rawVerificationToken,
        verificationTokenExpires: tokenExpiry,
      });

      try {
        await emailService.sendVerificationEmail(email, rawVerificationToken);
      } catch (mailErr) {
        console.error("Email sending failed:", mailErr);
        await User.findByIdAndDelete(newUser._id);

        return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "Could not send verification email. Registration failed. Please try again.",
        });
      }

      return res.status(httpStatusCode.CREATED).json({
        success: true,
        message: "Registration successful! Please check your email to verify your account.",
      });
    } catch (err) {
      console.error("Registration Error:", err);
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  // 2. VERIFY EMAIL
  
async verifyEmail(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "Verification token is missing",
      });
    }

    
    const user = await User.findOne({
      verificationToken: token.trim(),
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Mark verified & clear token fields
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return res.status(httpStatusCode.OK).json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });
  } catch (err) {
    console.error("Verification Error:", err);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

  // 3. LOGIN USER
  async login(req, res) {
    try {
      let { email, password } = req.body;

      if (!email || !password) {
        return res.status(httpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Email and password are required",
        });
      }

      email = email.toLowerCase().trim();

      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return res.status(httpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      if (user.status === "BLOCKED") {
        return res.status(httpStatusCode.FORBIDDEN).json({
          success: false,
          message: "Your account has been blocked by the Administrator",
        });
      }

      if (!user.isVerified) {
        return res.status(httpStatusCode.FORBIDDEN).json({
          success: false,
          message: "Your email is not verified. Please check your inbox.",
        });
      }

      const isMatch = await bcrypt.compare(String(password), user.password);

      if (!isMatch) {
        return res.status(httpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // 🏥 Fetch Clinic if this user is a Clinic Admin or Doctor
      let clinicId = null;
      if (user.role === "CLINIC_ADMIN") {
        const clinic = await Clinic.findOne({ ownerId: user._id });
        if (clinic) clinicId = clinic._id;
      }

      // 🔐 JWT Token with User ID + Clinic ID
      const token = jwt.sign(
        {
          id: user._id,
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          clinicId: clinicId, // 👈 Ab token me Clinic ID pack ho gayi!
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.status(httpStatusCode.OK).json({
        success: true,
        message: "Logged in successfully",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          clinicId: clinicId, // 👈 Frontend client ko bhi mil jayega
        },
        token: token,
      });
    } catch (err) {
      console.error("Login Error:", err);
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
}

module.exports = new AuthController();