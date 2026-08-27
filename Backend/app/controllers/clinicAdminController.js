const mongoose = require("mongoose");
const User = require("../models/UserModels");
const Doctor = require("../models/DoctorModel");
const Clinic = require("../models/ClinicModel");
const Appointment = require("../models/AppointmentModel");
const httpStatusCode = require("../utils/httpStatusCode");
const bcrypt = require("bcrypt");
const cloudinary = require('cloudinary').v2;


class ClinicAdminController {


  // Helper: Get Clinic ID from req or database fallback
  async _resolveClinicId(req) {
    let clinicId = req.params?.clinicId || req.query?.clinicId || req.user?.clinicId || req.body?.clinicId;


    //agr upr nahi mila , toh logged-in user ki ID se clinic table me search krte hai

    if (!clinicId && req.user?._id) {
      const clinic = await Clinic.findOne({ ownerId: req.user._id });
      if (clinic) clinicId = clinic._id;
    }
    return clinicId; //jo v valid clinic ID milti hai use return kr deta
  }


  //  DASHBOARD OVERVIEW & STATS

  async getDashboardOverview(req, res) {
    try {
      let clinicId = await this._resolveClinicId(req);

      //agr user super admin hai aur specific ID nahi di toh db ka pahla clinic select kr leta hai
      if (!clinicId && req.user?.role === "SUPER_ADMIN") {
        const firstClinic = await Clinic.findOne();
        if (firstClinic) clinicId = firstClinic._id;
      }


      if (!clinicId) {
        return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: "Clinic ID required" });
      }

      const clinicObjectId = new mongoose.Types.ObjectId(clinicId); //cnvrt string id to objectid for agg 

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      const activeDoctors = await Doctor.countDocuments({ clinicId });
      const todayAppointmentsCount = await Appointment.countDocuments({
        clinicId,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });
      const totalPatients = (await Appointment.distinct("patientId", { clinicId })).length; // extract today app patients count

      const monthlyRevenueResult = await Appointment.aggregate([
        {
          $match: {
            clinicId: clinicObjectId,
            status: "COMPLETED",
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        //dr collection se join kiya taaki doctor ki fees pata chle
        {
          $lookup: {
            from: "doctors",
            localField: "doctorId",
            foreignField: "_id",
            as: "doctor",
          },
        },
        { $unwind: "$doctor" },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $ifNull: ["$amountPaid", "$doctor.consultationFee", 0] } },
          },
        },
      ]);

      const monthlyRevenue = monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].totalRevenue : 0;

      //fetch today 10 app and join patient and dr deatails(populate)
      const todayQueue = await Appointment.find({
        clinicId,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      })
        .populate("patientId", "name email phone")
        .populate({
          path: "doctorId",
          populate: { path: "userId", select: "name" },
        })
        .sort({ createdAt: -1 })
        .limit(10);

      return res.status(httpStatusCode.OK).json({
        success: true,
        data: {
          stats: {
            totalPatients: totalPatients || 0,
            todayAppointments: todayAppointmentsCount || 0,
            activeDoctors: activeDoctors || 0,
            monthlyRevenue,
          },
          todayQueue: todayQueue || [],
        },
      });
    } catch (err) {
      console.error("Dashboard Overview Error:", err);
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
    }
  }


  //  DOCTORS MANAGEMENT

  async addDoctor(req, res) {
    try {


      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });


      const {
        name,
        email,
        password,
        phone,
        specialization,
        experienceYears,
        consultationFee,
        availableDays,
      } = req.body;

      const clinicId = await this._resolveClinicId(req);

      if (!clinicId) {
        return res
          .status(httpStatusCode.BAD_REQUEST)
          .json({ success: false, message: "Clinic ID required" });
      }

      // 1. Resolve Profile Image from Cloudinary / Multer
      let profileImage = "";

      if (req.file) {
        // If multer-storage-cloudinary is used, req.file.path already contains the Cloudinary URL.
        // If multer.diskStorage is used, upload manually via cloudinary uploader:
        if (req.file.path.startsWith("http")) {
          profileImage = req.file.path;
        } else {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "Medical_Images",
          });
          profileImage = result.secure_url;
        }
      } else if (req.body.profileImage) {
        profileImage = req.body.profileImage;
      }

      // 2. Validate all required fields including profileImage
      if (
        !name ||
        !email ||
        !password ||
        !specialization ||
        !consultationFee ||
        !profileImage
      ) {
        return res.status(httpStatusCode.BAD_REQUEST).json({
          success: false,
          message:
            "Name, email, password, specialization, consultation fee, and profile image are required",
        });
      }

      const existingUser = await User.findOne({
        email: email.toLowerCase().trim(),
      });
      if (existingUser) {
        return res
          .status(httpStatusCode.BAD_REQUEST)
          .json({ success: false, message: "Email already exists" });
      }

      // 3. Handle availableDays (Agar days string/JSON format mein aaye hain, toh unhe parse karke clean array banaya)
      let parsedDays = availableDays;
      if (typeof availableDays === "string") {
        try {
          parsedDays = JSON.parse(availableDays);
        } catch (e) {
          parsedDays = availableDays.split(",").map((d) => d.trim());
        }
      }

      // 4. Create User
      const hashedPassword = await bcrypt.hash(password, 10);

      //User table mein doctor ka account ban rhe
      const user = await User.create({
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone,
        role: "DOCTOR",
        isVerified: true,
      });

      // Phir Doctor table mein uski professional details aur profile image link kar di.
      const doctor = await Doctor.create({
        userId: user._id,
        clinicId,
        specialization,
        experienceYears: Number(experienceYears) || 0,
        consultationFee: Number(consultationFee),
        availableDays: parsedDays || [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        profileImage,
      });

      return res.status(httpStatusCode.CREATED).json({
        success: true,
        message: "Doctor added successfully",
        data: { user, doctor },
      });
    } catch (err) {
      console.error("Add Doctor Error:", err);
      return res
        .status(httpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: err.message });
    }
  }

  //Is clinic ke saare doctors unke User data (name, email, phone, status) ke sath fetch karke return karta hai.
  async getClinicDoctors(req, res) {
    try {
      const clinicId = await this._resolveClinicId(req);
      const doctors = await Doctor.find({ clinicId }).populate("userId", "name email phone status profileImage");
      return res.status(httpStatusCode.OK).json({ success: true, count: doctors.length, data: doctors });
    } catch (err) {
      console.error("Get Doctors Error:", err);
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
    }
  }


  //  PPOINTMENTS QUEUE

  async getAppointments(req, res) {
    try {
      const clinicId = await this._resolveClinicId(req);
      const { status, search } = req.query;

      // status filter(eg, PENDING, COMPLETED)
      let filter = { clinicId };
      if (status && status !== "ALL" && status !== "All Statuses") {
        filter.status = status.toUpperCase();
      }

      //Appointments ko Patient aur Doctor details ke sath fetch karke date ke hisab se sort kiya
      let appointments = await Appointment.find(filter)
        .populate("patientId", "name email phone age gender")
        .populate({
          path: "doctorId",
          populate: { path: "userId", select: "name" },
        })
        .sort({ appointmentDate: -1, createdAt: -1 });

      //agar search query aayi hai, toh memory mein filter karke patient name, doctor name, ya appointment ID match karta hai.
      if (search) {
        const queryLower = search.toLowerCase();
        appointments = appointments.filter((apt) => {
          const patientName = apt.patientId?.name?.toLowerCase() || "";
          const doctorName = apt.doctorId?.userId?.name?.toLowerCase() || "";
          const aptId = apt.appointmentId || apt._id.toString();
          return patientName.includes(queryLower) || doctorName.includes(queryLower) || aptId.includes(queryLower);
        });
      }

      return res.status(httpStatusCode.OK).json({ success: true, count: appointments.length, data: appointments });
    } catch (err) {
      console.error("Get Appointments Error:", err);
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
    }
  }

  async createAppointment(req, res) {
    try {
      const clinicId = await this._resolveClinicId(req);
      const { patientId, doctorId, appointmentDate, timeSlot, slotTime, type, notes, status } = req.body;

      if (!clinicId || !patientId || !doctorId) {
        return res.status(httpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Clinic ID, Patient ID, and Doctor ID are required",
        });
      }

      const count = await Appointment.countDocuments({ clinicId });

      //readable id generate 
      const appointmentId = `APT-${101 + count}`;


      //new app document database mein insert kiya
      const appointment = await Appointment.create({
        clinicId,
        patientId,
        doctorId,
        appointmentId,
        appointmentDate: appointmentDate || new Date(),
        timeSlot: timeSlot || slotTime || "10:30 AM",
        slotTime: timeSlot || slotTime || "10:30 AM",
        type: type || "General Checkup",
        notes,
        status: status || "PENDING",
      });

      return res.status(httpStatusCode.CREATED).json({
        success: true,
        message: "Appointment booked successfully",
        data: appointment,
      });
    } catch (err) {
      console.error("Create Appointment Error:", err);
      return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: err.message });
    }
  }

  //app ID dhoondh kar uska status update karta hai aur updated data return karta hai
  async updateAppointmentStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updated = await Appointment.findByIdAndUpdate(id, { status }, { new: true });
      return res.status(httpStatusCode.OK).json({ success: true, message: "Status updated", data: updated });
    } catch (err) {
      console.error("Update Status Error:", err);
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
    }
  }

  
  //  PATIENT RECORDS
  
  async getPatients(req, res) {
    try {
      const clinicId = await this._resolveClinicId(req);
      const { search } = req.query;

      //extract id of visited patient
      let patientIds = [];
      if (clinicId) {
        patientIds = await Appointment.distinct("patientId", { clinicId });
      }
// fetch only clinic patient
      let query = {};
      if (patientIds.length > 0) {
        query._id = { $in: patientIds };
      } else {
        query.role = "PATIENT";
      }

      //regex search
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      const patients = await User.find(query).select("name email phone age gender bloodGroup createdAt");

      //count every patient total visit - formdata
      const patientsWithVisits = await Promise.all(
        patients.map(async (p, idx) => {
          const totalVisits = clinicId ? await Appointment.countDocuments({ clinicId, patientId: p._id }) : 0;
          return {
            patientId: `PAT-${1080 + idx}`,
            _id: p._id,
            name: p.name,
            email: p.email,
            age: p.age || 26,
            gender: p.gender || "Male",
            contact: p.phone || "N/A",
            bloodGroup: p.bloodGroup || "O+",
            totalVisits: totalVisits || 1,
          };
        })
      );

      return res.status(httpStatusCode.OK).json({
        success: true,
        count: patientsWithVisits.length,
        data: patientsWithVisits,
      });
    } catch (err) {
      console.error("Get Patients Error:", err);
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
    }
  }


  //check patient already registered or not
  async registerPatient(req, res) {
    try {
      const { name, email, phone, age, gender, bloodGroup } = req.body;

// Agar naya patient hai toh default dummy password ke sath uska account bana deta hai.
      let user = await User.findOne({ email: email?.toLowerCase().trim() || "unknown" });
      if (!user) {
        user = await User.create({
          name,
          email: email?.toLowerCase().trim() || `${Date.now()}@patient.com`,
          phone,
          role: "PATIENT",
          age,
          gender,
          bloodGroup,
          password: await bcrypt.hash("123456", 10),
        });
      }

      return res.status(httpStatusCode.CREATED).json({ success: true, message: "Patient registered successfully", data: user });
    } catch (err) {
      console.error("Register Patient Error:", err);
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
    }
  }

 
  //  BILLING & INVOICES
 
  async getInvoices(req, res) {
    try {
      const clinicId = await this._resolveClinicId(req);

 //fetch all app
      let appointments = await Appointment.find({ clinicId })
        .populate("patientId", "name email phone")
        .populate({
          path: "doctorId",
          populate: { path: "userId", select: "name" },
        })
        .sort({ createdAt: -1 });

        //app data ko format kake invoice structure (INV-4090, amount, payment status, payment mode) me cnvrt krke return kiya.
      const invoices = appointments.map((apt, idx) => ({
        invoiceId: `INV-${4090 + idx}`,
        appointmentId: apt._id,
        patientName: apt.patientId?.name || "Walk-in Patient",
        doctorName: apt.doctorId?.userId?.name || "Consulting Doctor",
        date: apt.appointmentDate || apt.createdAt,
        mode: apt.paymentMode || "UPI / Online",
        amount: apt.amountPaid || apt.doctorId?.consultationFee || 500,
        status: apt.paymentStatus || (apt.status === "COMPLETED" ? "Paid" : "Pending"),
      }));

      return res.status(httpStatusCode.OK).json({ success: true, count: invoices.length, data: invoices });
    } catch (err) {
      console.error("Get Invoices Error:", err);
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
    }
  }

  // POST /clinic/invoices
  async createInvoice(req, res) {
    try {
      const clinicId = await this._resolveClinicId(req);
      const { patientName, patientId, doctorId, amount, paymentMethod, status } = req.body;

      let finalPatientId = patientId;

      //Walk-in patient ke case mein agar ID nahi hai, toh patient ka naya record create/find karta hai.
      if (!finalPatientId && patientName) {
        let patient = await Patient.findOne({ clinicId, name: patientName });
        if (!patient) {
          patient = await Patient.create({
            clinicId,
            name: patientName,
            phone: req.body.phone || '9876543210',
            email: `${Date.now()}@patient.com`,
          });
        }
        finalPatientId = patient._id;
      }

      // Format current time as default slot (e.g., "11:00 AM")
      const now = new Date();

      const defaultTimeSlot = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

//create bill/app record using walk-in consultation
      const newAppointment = await Appointment.create({
        clinicId,
        patientId: finalPatientId || undefined,
        doctorId: doctorId || undefined,
        amountPaid: Number(amount) || 500,
        paymentMode: paymentMethod || 'UPI / Online',
        paymentStatus: status?.toUpperCase() === 'PAID' ? 'Paid' : 'Pending',
        status: status?.toUpperCase() === 'PAID' ? 'COMPLETED' : 'CONFIRMED',
        appointmentDate: now,
        timeSlot: req.body.timeSlot || defaultTimeSlot, // 👈 Required field resolved
        type: 'Walk-in Consultation',
      });

      return res.status(201).json({
        success: true,
        message: 'Invoice created successfully',
        data: newAppointment,
      });
    } catch (error) {
      console.error('Create Invoice Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal Server Error',
      });
    }
  }

  
  //  CLINIC SETTINGS & RULES
  
  //Clinic ki details (timings, consultation fee, slot duration, emergency walk-in rules) fetch karke formatted response deta hai.
  async getClinicSettings(req, res) {
    try {
      const clinicId = await this._resolveClinicId(req);
      const clinic = await Clinic.findById(clinicId);

      if (!clinic) {
        return res.status(httpStatusCode.NOT_FOUND).json({ success: false, message: "Clinic not found" });
      }

      return res.status(httpStatusCode.OK).json({
        success: true,
        data: {
          name: clinic.name,
          phone: clinic.phone,
          email: clinic.email,
          address: clinic.address || "",
          openingTime: clinic.openingTime || "09:00 AM",
          closingTime: clinic.closingTime || "08:00 PM",
          standardFee: clinic.standardFee || 500,
          slotDuration: clinic.slotDuration || 15,
          allowEmergencyWalkIn: clinic.allowEmergencyWalkIn ?? true,
        },
      });
    } catch (err) {
      console.error("Get Settings Error:", err);
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
    }
  }

  // clinicAdminController.js
  async updateClinicSettings(req, res) {
    try {
      console.log('PATCH REQ BODY:', req.body);
      console.log('USER FROM TOKEN:', req.user);

      //  Safe ID Extraction to JWT token payload
      const clinicId = req.user?.clinicId || req.user?._id || req.user?.id;

      if (!clinicId) {
        return res.status(400).json({
          success: false,
          message: 'Clinic ID not present in token',
        });
      }

      // 2. Mongoose Cast Error se bachne ke liye safe check
      const updateData = { ...req.body };
      delete updateData._id; // id update mat hone do


      //Clinic details update karke updated document return karta hai.
      const updatedClinic = await Clinic.findByIdAndUpdate(
        clinicId,
        { $set: updateData },
        { new: true, runValidators: false }
      );

      return res.status(200).json({
        success: true,
        message: 'Clinic settings updated successfully',
        data: updatedClinic,
      });
    } catch (err) {
      console.error('PATCH ERROR LOG:', err); //  Yeh terminal mein print hoga
      return res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error',
      });
    }
  }
}

module.exports = new ClinicAdminController();