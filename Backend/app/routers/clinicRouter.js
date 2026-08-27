const express = require('express');
const router = express.Router();
const clinicAdminController = require('../controllers/clinicAdminController');
const AuthCheck = require('../middlewares/AuthMiddleware');
const authorizeRoles = require('../middlewares/RoleMiddleware');
const uploads = require('../utils/fileUpload')

// Security Middlewares Applied
router.use(AuthCheck);
router.use(authorizeRoles('CLINIC_ADMIN', 'SUPER_ADMIN'));

// 1. Dashboard Overview & Today's Queue
router.get('/dashboard', (req, res, next) => {
  // #swagger.tags = ['Clinic Admin']
  clinicAdminController.getDashboardOverview(req, res, next);
});

// 2. Doctors Management
router.get('/doctors', (req, res, next) => {
  // #swagger.tags = ['Clinic Admin']
  clinicAdminController.getClinicDoctors(req, res, next);
});

// 👇 Multer single upload added here matching the field name 'profileImage'
router.post('/doctors', uploads.single('profileImage'), (req, res, next) => {
  /* #swagger.tags = ['Clinic Admin']
     #swagger.consumes = ['multipart/form-data']
     #swagger.parameters['profileImage'] = {
        in: 'formData',
        type: 'file',
        required: true,
        description: 'Doctor profile picture'
     }
  */
  clinicAdminController.addDoctor(req, res, next);
});

// 3. Appointments Queue
router.get('/appointments', (req, res, next) => {
  // #swagger.tags = ['Clinic Admin']
  clinicAdminController.getAppointments(req, res, next);
});

router.post('/appointments', (req, res, next) => {
  // #swagger.tags = ['Clinic Admin']
  clinicAdminController.createAppointment(req, res, next);
});

router.patch('/appointments/:id/status', (req, res, next) => {
  // #swagger.tags = ['Clinic Admin']
  clinicAdminController.updateAppointmentStatus(req, res, next);
});

// 4. Patients Records
router.get('/patients', (req, res, next) => {
  // #swagger.tags = ['Clinic Admin']
  clinicAdminController.getPatients(req, res, next);
});

router.post('/patients', (req, res, next) => {
  // #swagger.tags = ['Clinic Admin']
  clinicAdminController.registerPatient(req, res, next);
});

// 5. Billing & Invoices
router.get('/invoices', (req, res, next) => {
  // #swagger.tags = ['Clinic Admin']
  clinicAdminController.getInvoices(req, res, next);
});

// 5. Billing & Invoices
router.post('/invoices', (req, res, next) => {
  // #swagger.tags = ['Clinic Admin']
  clinicAdminController.createInvoice(req, res, next);
});

// 6. Clinic Profile & Operating Settings
router.get('/settings', (req, res, next) => {
  // #swagger.tags = ['Clinic Admin']
  clinicAdminController.getClinicSettings(req, res, next);
});

router.put('/settings', (req, res, next) => {
  // #swagger.tags = ['Clinic Admin']
  clinicAdminController.updateClinicSettings(req, res, next);
});

module.exports = router;