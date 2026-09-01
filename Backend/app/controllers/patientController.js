// const mongoose = require("mongoose");
// const Doctor = require("../models/DoctorModel");
// const Appointment = require("../models/AppointmentModel");
// const Contact = require("../models/ContactModel");
// const httpStatusCode = require("../utils/httpStatusCode");
// const razorpay = require('../config/razorpayConfig'); 
// const crypto = require('crypto');

// class PatientController {
//   // ==========================================
//   // 1. GET ALL DOCTORS (SEARCH & SPECIALTY FILTER)
//   // ==========================================
//   // ==========================================
//   // GET ALL DOCTORS
//   // ==========================================
//   async getAllDoctors(req, res) {
//     try {
//       const { specialty, search } = req.query;
//       const filter = {};

//       if (specialty && specialty !== 'All' && specialty !== 'All Specialties') {
//         let rootKeyword = specialty.replace(/(ology|ologist|ics|ic|ist)$/i, '').trim();
//         if (rootKeyword.length < 3) rootKeyword = specialty;
//         filter.specialization = { $regex: rootKeyword, $options: 'i' };
//       }

//       const doctors = await Doctor.find(filter)
//         .populate('userId', 'name email phone profileImage')
//         .populate('clinicId', 'name address phone');

//       let list = doctors;
//       if (search) {
//         list = doctors.filter((doc) =>
//           doc.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
//           doc.specialization?.toLowerCase().includes(search.toLowerCase())
//         );
//       }

//       const formatted = list.map((doc) => ({
//         _id: doc._id,
//         id: doc._id,
//         name: doc.userId?.name || doc.name || 'Dr. Specialist',
//         specialization: doc.specialization || 'General Physician',
//         clinicName: doc.clinicId?.name || 'MediPulse Care Clinic',
//         clinicId: doc.clinicId?._id,
//         experienceYears: doc.experienceYears || 5,
//         consultationFee: doc.consultationFee || 500,
//         availableDays: doc.availableDays || ['Monday', 'Tuesday'],
//         rating: doc.rating !== undefined && doc.rating !== null ? doc.rating : 4.8,
//         nextAvailableSlot: '10:30 AM',
//         profileImage: doc?.profileImage || doc.userId?.profileImage,
//       }));

//       return res.status(httpStatusCode.OK).json({
//         success: true,
//         data: formatted,
//       });
//     } catch (error) {
//       console.error('Get All Doctors Error:', error);
//       return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
//         success: false,
//         message: error.message || 'Internal Server Error',
//       });
//     }
//   }

//   // ==========================================
//   // 2. BOOK OPD APPOINTMENT SLOT
//   // ==========================================
//   async bookAppointment(req, res) {
//     try {
//       const {
//         doctorId,
//         clinicId,
//         appointmentDate,
//         slotTime,
//         timeSlot,
//         type,
//         notes,
//       } = req.body;

//       // Patient ID from Auth Middleware or Request Body Fallback
//       const patientId = req.user?._id || req.body.patientId;

//       if (!patientId) {
//         return res.status(httpStatusCode.UNAUTHORIZED).json({
//           success: false,
//           message: "Patient is not authenticated. Please login again.",
//         });
//       }

//       if (!doctorId) {
//         return res.status(httpStatusCode.BAD_REQUEST).json({
//           success: false,
//           message: "Doctor ID is required for booking.",
//         });
//       }

//       const count = await Appointment.countDocuments();
//       const appointmentId = `APT-${101 + count}`;

//       let resolvedClinicId = clinicId;
//       if (!resolvedClinicId) {
//         const docRecord = await Doctor.findById(doctorId);
//         resolvedClinicId = docRecord?.clinicId;
//       }

//       const chosenSlot = timeSlot || slotTime || "10:30 AM";

//       const newAppointment = await Appointment.create({
//         appointmentId,
//         patientId,
//         doctorId,
//         clinicId: resolvedClinicId,
//         appointmentDate: appointmentDate
//           ? new Date(appointmentDate)
//           : new Date(),
//         timeSlot: chosenSlot, // 👈 Schema field 'timeSlot'
//         slotTime: chosenSlot, // 👈 Fallback if schema has 'slotTime'
//         type: type || "General Checkup",
//         notes: notes || "",
//         status: "WAITING",
//         paymentStatus: "PENDING", // 👈 Valid schema enum ('PENDING' or 'UNPAID')
//       });

//       return res.status(httpStatusCode.CREATED).json({
//         success: true,
//         message: "Appointment booked successfully!",
//         data: newAppointment,
//       });
//     } catch (error) {
//       console.error("Patient - Book Appointment Error:", error);
//       return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
//         success: false,
//         message: error.message || "Internal Server Error",
//       });
//     }
//   }

//   // ==========================================
//   // 3. GET MY BOOKINGS / LIVE TOKEN STATUS
  
//   async getMyAppointments(req, res) {
//     try {
//       // 1. Resolve Patient User ID safely from auth middleware or query/headers
//       const rawUserId = req.user?._id || req.user?.id || req.query?.patientId;

//       if (!rawUserId) {
//         return res.status(httpStatusCode.UNAUTHORIZED).json({
//           success: false,
//           message: "Patient identity not found. Please log in again.",
//         });
//       }

//       // Convert to ObjectId safely
//       let patientObjectId;
//       try {
//         patientObjectId = new mongoose.Types.ObjectId(rawUserId);
//       } catch (e) {
//         patientObjectId = rawUserId;
//       }

//       // 2. Query Appointments matching patientId OR user reference
//       const appointments = await Appointment.find({
//         $or: [
//           { patientId: patientObjectId },
//           { patientId: rawUserId },
//           { userId: patientObjectId },
//         ],
//       })
//         .populate({
//           path: "doctorId",
//           populate: { path: "userId", select: "name email phone profileImage" },
//         })
//         .populate("clinicId", "name address phone")
//         .sort({ createdAt: -1, appointmentDate: -1 });

//       // 3. Format strictly matching frontend expectations
//       const formatted = appointments.map((apt) => {
//         const docUser = apt.doctorId?.userId;
//         const doctorName =
//           docUser?.name || apt.doctorId?.name || "Dr. Specialist";
//         const docImg =
//           docUser?.profileImage ||
//           apt.doctorId?.profileImage ||
//           "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80";

//         const rawDate = apt.appointmentDate || apt.createdAt || new Date();
//         const formattedDate = new Date(rawDate).toLocaleDateString("en-GB", {
//           day: "2-digit",
//           month: "short",
//           year: "numeric",
//         });

//         const statusMap = {
//           WAITING: "Confirmed",
//           IN_PROGRESS: "Confirmed",
//           CONFIRMED: "Confirmed",
//           COMPLETED: "Completed",
//           CANCELLED: "Cancelled",
//           REJECTED: "Cancelled",
//         };

//         const currentStatus = (apt.status || "WAITING").toUpperCase();

//         return {
//           _id: apt._id,
//           id: apt._id,
//           appointmentId:
//             apt.appointmentId || `APT-${apt._id.toString().slice(-4)}`,
//           passNo: apt.appointmentId
//             ? `OPD-PASS-${apt.appointmentId.replace("APT-", "")}`
//             : `OPD-PASS-${apt._id.toString().slice(-4)}`,
//           doctorName: doctorName,
//           specialty:
//             apt.doctorId?.specialization || apt.type || "General Physician",
//           clinic: apt.clinicId?.name || "MediPulse Healthcare Hub",
//           doctorImg: docImg,
//           date: formattedDate,
//           timeSlot: apt.timeSlot || apt.slotTime || "10:30 AM",
//           fee: apt.doctorId?.consultationFee
//             ? `₹${apt.doctorId.consultationFee}`
//             : "₹500",
//           status: apt.status,
//           rawStatus: apt.status,
//         };
//       });

//       return res.status(httpStatusCode.OK).json({
//         success: true,
//         data: formatted,
//       });
//     } catch (error) {
//       console.error("Patient - Get My Appointments Error:", error);
//       return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
//         success: false,
//         message: error.message || "Internal Server Error",
//       });
//     }
//   }

//   // ==========================================
//   // 4. SUBMIT PATIENT REVIEW & RATING
  
//   async submitFeedback(req, res) {
//     try {
//       const { id } = req.params;
//       const { rating, comment } = req.body;

//       if (!rating) {
//         return res.status(httpStatusCode.BAD_REQUEST).json({
//           success: false,
//           message: 'Rating is required.',
//         });
//       }

//       const numericRating = Number(rating);

//       // Case 1: Check if 'id' belongs to an Appointment
//       let appointment = await Appointment.findById(id);
//       if (appointment) {
//         appointment.rating = numericRating;
//         appointment.feedback = comment || '';
//         await appointment.save();

//         return res.status(httpStatusCode.OK).json({
//           success: true,
//           message: 'Feedback submitted successfully for appointment!',
//           data: appointment,
//         });
//       }

//       // Case 2: Check if 'id' belongs to a Doctor directly
//       const doctor = await Doctor.findById(id);
//       if (doctor) {
//         const currentCount = doctor.ratingCount || 0;
//         const currentRating = doctor.rating || 0;

//         let updatedRating;
//         if (currentCount === 0) {
//           // Pehla review hai toh direct wahi rating hogi
//           updatedRating = numericRating;
//         } else {
//           // Weighted Average
//           updatedRating = Number(
//             (((currentRating * currentCount) + numericRating) / (currentCount + 1)).toFixed(1)
//           );
//         }

//         doctor.rating = updatedRating;
//         doctor.ratingCount = currentCount + 1;
//         await doctor.save();

//         return res.status(httpStatusCode.OK).json({
//           success: true,
//           message: `Feedback submitted successfully for Doctor!`,
//           data: { doctorId: doctor._id, rating: updatedRating, ratingCount: doctor.ratingCount },
//         });
//       }

//       return res.status(httpStatusCode.NOT_FOUND).json({
//         success: false,
//         message: 'Doctor or Appointment not found.',
//       });
//     } catch (error) {
//       console.error('Submit Feedback Error:', error);
//       return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
//         success: false,
//         message: error.message || 'Internal Server Error',
//       });
//     }
//   }

//   // ==========================================
//   // 5. CONTACT HEALTH DESK INQUIRY
//   // ==========================================
//   async submitContactInquiry(req, res) {
//     try {
//       const { name, phone, message } = req.body;

//       if (!name || !phone || !message) {
//         return res.status(httpStatusCode.BAD_REQUEST).json({
//           success: false,
//           message: "Name, phone and message are required fields",
//         });
//       }

//       const inquiry = await Contact.create({
//         name,
//         phone,
//         message,
//         status: "PENDING",
//       });

//       return res.status(httpStatusCode.CREATED).json({
//         success: true,
//         message:
//           "Inquiry submitted successfully! Our health desk will contact you within 15 minutes.",
//         data: inquiry,
//       });
//     } catch (error) {
//       console.error("Patient - Contact Inquiry Error:", error);
//       return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
//         success: false,
//         message: error.message || "Internal Server Error",
//       });
//     }
//   }

//   // 6. Create Razorpay Order
//   async createRazorpayOrder(req, res) {
//     try {
//       const { amount } = req.body;

//       const options = {
//         amount: Math.round(Number(amount) * 100),
//         currency: 'INR',
//         receipt: `receipt_${Date.now()}`,
//       };

//       const order = await razorpay.orders.create(options);

//       return res.status(httpStatusCode.OK).json({
//         success: true,
//         order,
//       });
//     } catch (error) {
//       console.error('Razorpay Create Order Error:', error);
//       return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
//         success: false,
//         message: error.message || 'Failed to initiate order',
//       });
//     }
//   }

//   // 7. Verify Razorpay Payment & Confirm Appointment
//   async verifyPaymentAndBook(req, res) {
//     try {
//       const {
//         razorpay_order_id,
//         razorpay_payment_id,
//         razorpay_signature,
//         bookingData,
//       } = req.body;

//       const secret = process.env.RAZORPAY_KEY_SECRET || '76lVwR1vsKGotHUGZLUbRwC2';
//       const body = razorpay_order_id + '|' + razorpay_payment_id;
//       const expectedSignature = crypto
//         .createHmac('sha256', secret)
//         .update(body.toString())
//         .digest('hex');

//       if (expectedSignature !== razorpay_signature) {
//         return res.status(httpStatusCode.BAD_REQUEST).json({
//           success: false,
//           message: 'Payment verification failed: Invalid Signature',
//         });
//       }

//       const patientId = req.user?._id || bookingData.patientId;
//       const count = await Appointment.countDocuments();
//       const appointmentId = `APT-${101 + count}`;

//       let resolvedClinicId = bookingData.clinicId;
//       if (!resolvedClinicId && bookingData.doctorId) {
//         const docRecord = await Doctor.findById(bookingData.doctorId);
//         resolvedClinicId = docRecord?.clinicId;
//       }

//       const newAppointment = await Appointment.create({
//         appointmentId,
//         patientId,
//         doctorId: bookingData.doctorId,
//         clinicId: resolvedClinicId,
//         appointmentDate: bookingData.appointmentDate ? new Date(bookingData.appointmentDate) : new Date(),
//         timeSlot: bookingData.timeSlot || '10:30 AM',
//         type: bookingData.type || 'General Checkup',
//         status: 'CONFIRMED',
//         paymentStatus: 'PAID',
//         paymentDetails: {
//           orderId: razorpay_order_id,
//           paymentId: razorpay_payment_id,
//         },
//       });

//       return res.status(httpStatusCode.CREATED).json({
//         success: true,
//         message: 'Payment verified and appointment confirmed successfully!',
//         data: newAppointment,
//       });
//     } catch (error) {
//       console.error('Verify Payment Error:', error);
//       return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
//         success: false,
//         message: error.message || 'Internal Server Error during booking verification',
//       });
//     }
//   }
// }

// module.exports = new PatientController();






const mongoose = require("mongoose");
const Doctor = require("../models/DoctorModel");
const Appointment = require("../models/AppointmentModel");
const Contact = require("../models/ContactModel");
const httpStatusCode = require("../utils/httpStatusCode");
const stripe = require("../config/stripeConfig");

class PatientController {
  // ==========================================
  // 1. GET ALL DOCTORS (SEARCH & SPECIALTY FILTER)
  // ==========================================
  async getAllDoctors(req, res) {
    try {
      const { specialty, search } = req.query;
      const filter = {};

      if (specialty && specialty !== 'All' && specialty !== 'All Specialties') {
        let rootKeyword = specialty.replace(/(ology|ologist|ics|ic|ist)$/i, '').trim();
        if (rootKeyword.length < 3) rootKeyword = specialty;
        filter.specialization = { $regex: rootKeyword, $options: 'i' };
      }

      const doctors = await Doctor.find(filter)
        .populate('userId', 'name email phone profileImage')
        .populate('clinicId', 'name address phone');

      let list = doctors;
      if (search) {
        list = doctors.filter((doc) =>
          doc.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
          doc.specialization?.toLowerCase().includes(search.toLowerCase())
        );
      }

      const formatted = list.map((doc) => ({
        _id: doc._id,
        id: doc._id,
        name: doc.userId?.name || doc.name || 'Dr. Specialist',
        specialization: doc.specialization || 'General Physician',
        clinicName: doc.clinicId?.name || 'MediPulse Care Clinic',
        clinicId: doc.clinicId?._id,
        experienceYears: doc.experienceYears || 5,
        consultationFee: doc.consultationFee || 500,
        availableDays: doc.availableDays || ['Monday', 'Tuesday'],
        rating: doc.rating !== undefined && doc.rating !== null ? doc.rating : 4.8,
        nextAvailableSlot: '10:30 AM',
        profileImage: doc?.profileImage || '',
      }));

      return res.status(httpStatusCode.OK).json({
        success: true,
        data: formatted,
      });
    } catch (error) {
      console.error('Get All Doctors Error:', error);
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Internal Server Error',
      });
    }
  }

  // ==========================================
  // 2. BOOK OPD APPOINTMENT SLOT (MANUAL/OFFLINE)
  // ==========================================
  async bookAppointment(req, res) {
    try {
      const {
        doctorId,
        clinicId,
        appointmentDate,
        slotTime,
        timeSlot,
        type,
        notes,
      } = req.body;

      const patientId = req.user?._id || req.body.patientId;

      if (!patientId) {
        return res.status(httpStatusCode.UNAUTHORIZED).json({
          success: false,
          message: "Patient is not authenticated. Please login again.",
        });
      }

      if (!doctorId) {
        return res.status(httpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Doctor ID is required for booking.",
        });
      }

      const count = await Appointment.countDocuments();
      const appointmentId = `APT-${101 + count}`;

      let resolvedClinicId = clinicId;
      if (!resolvedClinicId) {
        const docRecord = await Doctor.findById(doctorId);
        resolvedClinicId = docRecord?.clinicId;
      }

      const chosenSlot = timeSlot || slotTime || "10:30 AM";

      const newAppointment = await Appointment.create({
        appointmentId,
        patientId,
        doctorId,
        clinicId: resolvedClinicId,
        appointmentDate: appointmentDate
          ? new Date(appointmentDate)
          : new Date(),
        timeSlot: chosenSlot,
        slotTime: chosenSlot,
        type: type || "General Checkup",
        notes: notes || "",
        status: "WAITING",
        paymentStatus: "PENDING",
      });

      return res.status(httpStatusCode.CREATED).json({
        success: true,
        message: "Appointment booked successfully!",
        data: newAppointment,
      });
    } catch (error) {
      console.error("Patient - Book Appointment Error:", error);
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ==========================================
  // 3. GET MY BOOKINGS / LIVE TOKEN STATUS
  // ==========================================
  async getMyAppointments(req, res) {
    try {
      const rawUserId = req.user?._id || req.user?.id || req.query?.patientId;

      if (!rawUserId) {
        return res.status(httpStatusCode.UNAUTHORIZED).json({
          success: false,
          message: "Patient identity not found. Please log in again.",
        });
      }

      let patientObjectId;
      try {
        patientObjectId = new mongoose.Types.ObjectId(rawUserId);
      } catch (e) {
        patientObjectId = rawUserId;
      }

      const appointments = await Appointment.find({
        $or: [
          { patientId: patientObjectId },
          { patientId: rawUserId },
          { userId: patientObjectId },
        ],
      })
        .populate({
          path: "doctorId",
          populate: { path: "userId", select: "name email phone profileImage" },
        })
        .populate("clinicId", "name address phone")
        .sort({ createdAt: -1, appointmentDate: -1 });

      const formatted = appointments.map((apt) => {
        const docUser = apt.doctorId?.userId;
        const doctorName =
          docUser?.name || apt.doctorId?.name || "Dr. Specialist";
        const docImg =
          docUser?.profileImage ||
          apt.doctorId?.profileImage ||
          "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80";

        const rawDate = apt.appointmentDate || apt.createdAt || new Date();
        const formattedDate = new Date(rawDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        const statusMap = {
          WAITING: "Confirmed",
          IN_PROGRESS: "Confirmed",
          CONFIRMED: "Confirmed",
          COMPLETED: "Completed",
          CANCELLED: "Cancelled",
          REJECTED: "Cancelled",
        };

        const currentStatus = (apt.status || "WAITING").toUpperCase();

        return {
          _id: apt._id,
          id: apt._id,
          appointmentId:
            apt.appointmentId || `APT-${apt._id.toString().slice(-4)}`,
          passNo: apt.appointmentId
            ? `OPD-PASS-${apt.appointmentId.replace("APT-", "")}`
            : `OPD-PASS-${apt._id.toString().slice(-4)}`,
          doctorName: doctorName,
          specialty:
            apt.doctorId?.specialization || apt.type || "General Physician",
          clinic: apt.clinicId?.name || "MediPulse Healthcare Hub",
          doctorImg: docImg,
          date: formattedDate,
          timeSlot: apt.timeSlot || apt.slotTime || "10:30 AM",
          fee: apt.doctorId?.consultationFee
            ? `₹${apt.doctorId.consultationFee}`
            : "₹500",
          status: statusMap[currentStatus] || "Confirmed",
          rawStatus: apt.status,
        };
      });

      return res.status(httpStatusCode.OK).json({
        success: true,
        data: formatted,
      });
    } catch (error) {
      console.error("Patient - Get My Appointments Error:", error);
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ==========================================
  // 4. SUBMIT PATIENT REVIEW & RATING
  // ==========================================
  async submitFeedback(req, res) {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;

      if (!rating) {
        return res.status(httpStatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Rating is required.',
        });
      }

      const numericRating = Number(rating);

      let appointment = await Appointment.findById(id);
      if (appointment) {
        appointment.rating = numericRating;
        appointment.feedback = comment || '';
        await appointment.save();

        return res.status(httpStatusCode.OK).json({
          success: true,
          message: 'Feedback submitted successfully for appointment!',
          data: appointment,
        });
      }

      const doctor = await Doctor.findById(id);
      if (doctor) {
        const currentCount = doctor.ratingCount || 0;
        const currentRating = doctor.rating || 0;

        let updatedRating;
        if (currentCount === 0) {
          updatedRating = numericRating;
        } else {
          updatedRating = Number(
            (((currentRating * currentCount) + numericRating) / (currentCount + 1)).toFixed(1)
          );
        }

        doctor.rating = updatedRating;
        doctor.ratingCount = currentCount + 1;
        await doctor.save();

        return res.status(httpStatusCode.OK).json({
          success: true,
          message: `Feedback submitted successfully for Doctor!`,
          data: { doctorId: doctor._id, rating: updatedRating, ratingCount: doctor.ratingCount },
        });
      }

      return res.status(httpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Doctor or Appointment not found.',
      });
    } catch (error) {
      console.error('Submit Feedback Error:', error);
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Internal Server Error',
      });
    }
  }

  // ==========================================
  // 5. CONTACT HEALTH DESK INQUIRY
  // ==========================================
  async submitContactInquiry(req, res) {
    try {
      const { name, phone, message } = req.body;

      if (!name || !phone || !message) {
        return res.status(httpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Name, phone and message are required fields",
        });
      }

      const inquiry = await Contact.create({
        name,
        phone,
        message,
        status: "PENDING",
      });

      return res.status(httpStatusCode.CREATED).json({
        success: true,
        message:
          "Inquiry submitted successfully! Our health desk will contact you within 15 minutes.",
        data: inquiry,
      });
    } catch (error) {
      console.error("Patient - Contact Inquiry Error:", error);
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ==========================================
  // 6. CREATE STRIPE PAYMENT INTENT
  // ==========================================
  async createStripePaymentIntent(req, res) {
    try {
      const { doctorId, timeSlot } = req.body;
      const patientId = req.user?._id || req.user?.id || req.body.patientId;

      if (!doctorId) {
        return res.status(httpStatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Doctor ID is required to initiate payment.',
        });
      }

      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(httpStatusCode.NOT_FOUND).json({
          success: false,
          message: 'Doctor not found.',
        });
      }

      // Fetch fee dynamically from DB to prevent client-side price tampering
      const rawFee = typeof doctor.consultationFee === 'number' 
        ? doctor.consultationFee 
        : Number(String(doctor.consultationFee).replace(/[^0-9]/g, '')) || 500;
        
      const amountInSubunits = Math.round(rawFee * 100); // Smallest currency unit (paise/cents)

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInSubunits,
        currency: 'inr',
        automatic_payment_methods: { enabled: true },
        metadata: {
          doctorId: doctor._id.toString(),
          patientId: patientId ? patientId.toString() : '',
          clinicId: doctor.clinicId ? doctor.clinicId.toString() : '',
          timeSlot: timeSlot || '10:30 AM',
        },
      });

      return res.status(httpStatusCode.OK).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error) {
      console.error('Stripe Payment Intent Error:', error);
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to initiate Stripe payment intent',
      });
    }
  }

  // ==========================================
  // 7. VERIFY STRIPE PAYMENT & CONFIRM APPOINTMENT
  // ==========================================
  async confirmStripePaymentAndBook(req, res) {
    try {
      const { paymentIntentId, bookingData } = req.body;

      if (!paymentIntentId) {
        return res.status(httpStatusCode.BAD_REQUEST).json({
          success: false,
          message: 'PaymentIntent ID is required for verification.',
        });
      }

      // Verify payment status with Stripe directly
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        return res.status(httpStatusCode.BAD_REQUEST).json({
          success: false,
          message: `Payment not completed. Current status: ${paymentIntent.status}`,
        });
      }

      const patientId = req.user?._id || req.user?.id || bookingData?.patientId;

      if (!patientId) {
        return res.status(httpStatusCode.UNAUTHORIZED).json({
          success: false,
          message: 'Patient ID missing during booking confirmation.',
        });
      }

      const count = await Appointment.countDocuments();
      const appointmentId = `APT-${101 + count}`;

      let resolvedClinicId = bookingData?.clinicId;
      if (!resolvedClinicId && bookingData?.doctorId) {
        const docRecord = await Doctor.findById(bookingData.doctorId);
        resolvedClinicId = docRecord?.clinicId;
      }

      const chosenSlot = bookingData?.timeSlot || '10:30 AM';

      const newAppointment = await Appointment.create({
        appointmentId,
        patientId,
        doctorId: bookingData.doctorId,
        clinicId: resolvedClinicId,
        appointmentDate: bookingData.appointmentDate ? new Date(bookingData.appointmentDate) : new Date(),
        timeSlot: chosenSlot,
        slotTime: chosenSlot,
        type: bookingData.type || 'General Checkup',
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        paymentDetails: {
          paymentIntentId: paymentIntent.id,
          currency: paymentIntent.currency,
          amountPaid: paymentIntent.amount_received / 100,
          paymentMethod: paymentIntent.payment_method_types?.[0] || 'card',
        },
      });

      return res.status(httpStatusCode.CREATED).json({
        success: true,
        message: 'Payment verified and appointment confirmed successfully!',
        data: newAppointment,
      });
    } catch (error) {
      console.error('Confirm Stripe Payment Error:', error);
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Internal Server Error during booking verification',
      });
    }
  }
}

module.exports = new PatientController();