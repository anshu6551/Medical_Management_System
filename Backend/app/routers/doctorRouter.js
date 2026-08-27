const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const AuthCheck = require('../middlewares/AuthMiddleware');

// Auth middleware applied
router.use(AuthCheck);

// 1. OPD Queue & Stats
router.get('/dashboard', (req, res) => {
  // #swagger.tags = ['Doctor Portal']
  doctorController.getDoctorOPDQueue(req, res);
});

router.put('/queue/:appointmentId/status', (req, res) => {
  // #swagger.tags = ['Doctor Portal']
  doctorController.updateQueueStatus(req, res);
});

// 2. Schedule
router.get('/schedule', (req, res) => {
  // #swagger.tags = ['Doctor Portal']
  doctorController.getSchedule(req, res);
});

router.put('/schedule', (req, res) => {
  // #swagger.tags = ['Doctor Portal']
  doctorController.updateSchedule(req, res);
});

// 3. Feedback & Reviews
router.get('/feedback', (req, res) => {
  // #swagger.tags = ['Doctor Portal']
  doctorController.getReviews(req, res);
});

// 4. Prescriptions
router.get('/appointments/:appointmentId/prescription', (req, res) => {
  // #swagger.tags = ['Doctor Portal']
  doctorController.getPrescription(req, res);
});

router.put('/appointments/:appointmentId/prescription', (req, res) => {
  // #swagger.tags = ['Doctor Portal']
  doctorController.savePrescription(req, res);
});

module.exports = router;