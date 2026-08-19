const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const AuthCheck = require('../middlewares/AuthMiddleware');

// ==========================================
// PUBLIC ROUTES (No Login Required)
// ==========================================

// 1. Get All Doctors / Search & Filter by Specialty
router.get('/doctors', (req, res) => {
  // #swagger.tags = ['Patient Portal']
  patientController.getAllDoctors(req, res);
});

// 2. Health Desk Inquiry Form
router.post('/contact', (req, res) => {
  // #swagger.tags = ['Patient Portal']
  patientController.submitContactInquiry(req, res);
});

// ==========================================
// PROTECTED ROUTES (Patient Login Required)
// ==========================================

// 3. Book OPD Appointment Slot
router.post('/appointments', AuthCheck, (req, res) => {
  // #swagger.tags = ['Patient Portal']
  patientController.bookAppointment(req, res);
});

// 4. Get My Bookings & Medical History
router.get('/appointments', AuthCheck, (req, res) => {
  // #swagger.tags = ['Patient Portal']
  patientController.getMyAppointments(req, res);
});

// 5. Submit Feedback / Rating for Appointment OR Doctor Card
router.put('/appointments/:id/feedback', AuthCheck, (req, res) => {
  // #swagger.tags = ['Patient Portal']
  patientController.submitFeedback(req, res);
});

// 6. Direct Doctor Review (Fallback)
router.post('/doctors/:id/feedback', AuthCheck, (req, res) => {
  // #swagger.tags = ['Patient Portal']
  patientController.submitFeedback(req, res);
});

router.post('/create-razorpay-order', AuthCheck, (req, res) => {
  // #swagger.tags = ['Patient Portal']
  patientController.createRazorpayOrder(req, res);
});

router.post('/verify-payment', AuthCheck, (req, res) => {
  // #swagger.tags = ['Patient Portal']
  patientController.verifyPaymentAndBook(req, res);
});

module.exports = router;