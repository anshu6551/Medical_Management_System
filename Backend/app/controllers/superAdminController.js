const Clinic = require("../models/ClinicModel");
const User = require("../models/UserModels");
const Subscription = require("../models/SubscriptionModel");
const httpStatusCode = require("../utils/httpStatusCode");
const SystemSetting = require("../models/SystemSettingModel");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const emailService = require("../utils/emailService");

class SuperAdminController {
  // 1. GET SYSTEM GOVERNANCE DASHBOARD STATS
  async getDashboardStats(req, res) {
    try {
      const totalClinics = await Clinic.countDocuments();
      const activeClinics = await Clinic.countDocuments({ status: "APPROVED" });
      const pendingClinics = await Clinic.countDocuments({ status: "PENDING" });
      const totalDoctors = await User.countDocuments({ role: "DOCTOR" });
      const totalPatients = await User.countDocuments({ role: "PATIENT" });

      // Dynamic MRR Calculation from Active Clinics
      const mrrResult = await Clinic.aggregate([
        { $match: { status: "APPROVED" } }, // Sirf Active/Approved Clinics
        {
          $lookup: {
            from: "subscriptions", // Collection name (check your DB collection name)
            localField: "subscriptionPlan",
            foreignField: "_id",
            as: "plan",
          },
        },
        { $unwind: "$plan" },
        {
          $group: {
            _id: null,
            totalMrr: { $sum: "$plan.price" },
          },
        },
      ]);

      const mrr = mrrResult.length > 0 ? mrrResult[0].totalMrr : 0;

      return res.status(httpStatusCode.OK).json({
        success: true,
        data: {
          totalClinics,
          activeClinics,
          pendingClinics,
          totalDoctors,
          totalPatients,
          mrr, // Live calculated MRR
        },
      });
    } catch (err) {
      console.error("Super Admin Stats Error:", err);
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: err.message || "Internal Server Error",
      });
    }
  }

  // 2. GET ALL CLINICS
  async getAllClinics(req, res) {
    try {
      const clinics = await Clinic.find()
        .populate("ownerId", "name email phone")
        .populate("subscriptionPlan")
        .sort({ createdAt: -1 });

      return res.status(httpStatusCode.OK).json({
        success: true,
        count: clinics.length,
        data: clinics,
      });
    } catch (err) {
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: err.message,
      });
    }
  }

  // 3. ONBOARD NEW CLINIC TENANT
  async onboardClinic(req, res) {
    try {
      const {
        name,
        email,
        phone,
        city,
        address,
        password,
        adminName,
        subscriptionPlan,
      } = req.body;

      if (!name || !email || !phone || !city || !password) {
        return res.status(httpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Clinic name, email, phone, city, and password are required",
        });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // 1. Check existing user
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(httpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "An account with this email already exists",
        });
      }

      // 2. Hash Password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 3. Create Clinic Admin User (Directly Verified)
      const newAdminUser = await User.create({
        name: adminName || `${name} Admin`,
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone,
        role: "CLINIC_ADMIN",
        status: "ACTIVE",
        isVerified: true, // 👈 Token generation aur verification step skip ho gaya
      });

      // 4. Create Clinic Tenant & Map Owner
      const newClinic = await Clinic.create({
        name,
        email: normalizedEmail,
        phone,
        city,
        address,
        ownerId: newAdminUser._id,
        subscriptionPlan: subscriptionPlan || null,
        status: "APPROVED",
      });

      // 5. Optional: Send Welcome/Credentials Email (Background notification)
      try {
        if (emailService.sendWelcomeEmail) {
          await emailService.sendWelcomeEmail(normalizedEmail, password);
        }
      } catch (mailErr) {
        console.warn(
          "Welcome email failed, but clinic created:",
          mailErr.message,
        );
      }

      return res.status(httpStatusCode.CREATED).json({
        success: true,
        message: "Clinic onboarded successfully. Admin can log in immediately.",
        data: {
          clinic: newClinic,
          adminUser: {
            id: newAdminUser._id,
            name: newAdminUser.name,
            email: newAdminUser.email,
            role: newAdminUser.role,
          },
        },
      });
    } catch (err) {
      console.error("Onboard Clinic Error:", err);
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: err.message || "Internal Server Error",
      });
    }
  }

  // 4. APPROVE OR SUSPEND CLINIC
  async updateClinicStatus(req, res) {
    try {
      const { clinicId } = req.params;
      const { status } = req.body; // 'APPROVED' | 'SUSPENDED' | 'PENDING'

      if (!["APPROVED", "SUSPENDED", "PENDING"].includes(status)) {
        return res.status(httpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Invalid status value provided",
        });
      }

      const clinic = await Clinic.findByIdAndUpdate(
        clinicId,
        { status },
        { new: true },
      );

      if (!clinic) {
        return res.status(httpStatusCode.NOT_FOUND).json({
          success: false,
          message: "Clinic tenant not found",
        });
      }

      return res.status(httpStatusCode.OK).json({
        success: true,
        message: `Clinic status updated to ${status}`,
        data: clinic,
      });
    } catch (err) {
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: err.message,
      });
    }
  }

  // 5. CREATE OR UPDATE SAAS SUBSCRIPTION PLAN
  async saveSubscriptionPlan(req, res) {
    try {
      const { id, name, price, period, features, highlight } = req.body;

      if (!name || price === undefined || !period) {
        return res.status(httpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Plan name, price, and billing period are required",
        });
      }

      let plan;
      if (id) {
        // Update Plan
        plan = await Subscription.findByIdAndUpdate(
          id,
          { name, price, period, features, highlight },
          { new: true },
        );
      } else {
        // Create Plan
        plan = await Subscription.create({
          name,
          price,
          period,
          features,
          highlight,
        });
      }

      return res.status(httpStatusCode.OK).json({
        success: true,
        message: id ? "Subscription plan updated" : "Subscription plan created",
        data: plan,
      });
    } catch (err) {
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: err.message,
      });
    }
  }

  // 6. BLOCK OR UNBLOCK GLOBAL USER
  async toggleUserStatus(req, res) {
    try {
      const { userId } = req.params;
      const { status } = req.body; // 'ACTIVE' | 'BLOCKED'

      if (!["ACTIVE", "BLOCKED"].includes(status)) {
        return res.status(httpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Invalid user status",
        });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { status },
        { new: true },
      );

      if (!user) {
        return res.status(httpStatusCode.NOT_FOUND).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(httpStatusCode.OK).json({
        success: true,
        message: `User status changed to ${status}`,
        data: user,
      });
    } catch (err) {
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: err.message,
      });
    }
  }

  // GET All Platform Users across system
  async getAllPlatformUsers(req, res) {
    try {
      const { role, status, search } = req.query;

      let query = {};

      // Filter by Role (DOCTOR, PATIENT, CLINIC_ADMIN, etc.)
      if (role && role !== "All") {
        query.role = role.toUpperCase();
      }

      // Filter by Status (ACTIVE, BLOCKED)
      if (status && status !== "All") {
        query.status = status.toUpperCase();
      }

      // Search by Name or Email
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      // Direct find without invalid populate
      const users = await User.find(query)
        .select("-password")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (err) {
      console.error("Fetch Platform Users Error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
      });
    }
  }
  // 8. GET DETAILED REVENUE & TIER BREAKDOWN REPORTS
  async getRevenueReports(req, res) {
    try {
      const activeClinics = await Clinic.find({ status: "APPROVED" }).populate("subscriptionPlan");

      let totalMrr = 0;
      let proEarnings = 0;
      let enterpriseEarnings = 0;

      activeClinics.forEach((clinic) => {
        const planPrice = clinic.subscriptionPlan?.price || 0;
        const planName = clinic.subscriptionPlan?.name?.toUpperCase() || "";

        totalMrr += planPrice;

        if (planName.includes("PRO")) {
          proEarnings += planPrice;
        } else if (planName.includes("ENTERPRISE")) {
          enterpriseEarnings += planPrice;
        }
      });

      return res.status(httpStatusCode.OK).json({
        success: true,
        data: {
          totalMrr,
          growthPercentage: 18.4,
          proEarnings,
          enterpriseEarnings,
        },
      });
    } catch (err) {
      console.error("Revenue Report Error:", err);
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: err.message || "Internal Server Error",
      });
    }
  }

  // 9. EXPORT FULL PLATFORM AUDIT CSV
  async exportRevenueCSV(req, res) {
    try {
      const clinics = await Clinic.find()
        .populate("subscriptionPlan")
        .sort({ createdAt: -1 });

      let csv = "Clinic Name,Email,City,Plan,Status,Onboarded Date\n";

      clinics.forEach((c) => {
        const planName = c.subscriptionPlan?.name || "N/A";
        const date = c.createdAt ? new Date(c.createdAt).toISOString().split("T")[0] : "N/A";
        csv += `"${c.name}","${c.email}","${c.city || "N/A"}","${planName}","${c.status}","${date}"\n`;
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=platform-audit-report.csv");
      return res.status(httpStatusCode.OK).send(csv);
    } catch (err) {
      console.error("Export CSV Error:", err);
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: err.message || "Internal Server Error",
      });
    }
  }

  // GET SYSTEM SETTINGS
  async getSystemSettings(req, res) {
    try {
      let settings = await SystemSetting.findOne();
      if (!settings) {
        settings = await SystemSetting.create({
          announcement: "",
          isMaintenanceMode: false,
        });
      }
      return res.status(httpStatusCode.OK || 200).json({ 
        success: true, 
        data: settings 
      });
    } catch (err) {
      console.error("Get Settings Error:", err);
      // Fallback empty response to prevent server crash & artificial CORS blockage
      return res.status(httpStatusCode.OK || 200).json({ 
        success: true, 
        data: { announcement: "", isMaintenanceMode: false } 
      });
    }
  }

  // UPDATE SYSTEM SETTINGS
  async updateSystemSettings(req, res) {
    try {
      const { announcement, isMaintenanceMode } = req.body;
      
      let settings = await SystemSetting.findOne();
      if (!settings) {
        settings = new SystemSetting({});
      }

      if (announcement !== undefined) settings.announcement = announcement;
      if (isMaintenanceMode !== undefined) settings.isMaintenanceMode = isMaintenanceMode;

      await settings.save();

      return res.status(httpStatusCode.OK || 200).json({
        success: true,
        message: "System settings updated successfully",
        data: settings,
      });
    } catch (err) {
      console.error("Update Settings Error:", err);
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR || 500).json({ 
        success: false, 
        message: err.message || "Failed to update settings" 
      });
    }
  }
}

module.exports = new SuperAdminController();
