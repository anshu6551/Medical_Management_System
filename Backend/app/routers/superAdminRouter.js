const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const AuthCheck = require('../middlewares/AuthMiddleware');
const authorizeRoles = require('../middlewares/RoleMiddleware');

// Security Middlewares Applied
router.use(AuthCheck);
router.use(authorizeRoles('SUPER_ADMIN'));

router.get('/dashboard-stats', (req, res, next) => {
  // #swagger.tags = ['Super Admin']
  superAdminController.getDashboardStats(req, res, next);
});

router.get('/clinics', (req, res, next) => {
  // #swagger.tags = ['Super Admin']
  superAdminController.getAllClinics(req, res, next);
});

router.post('/clinics/onboard', (req, res, next) => {
  // #swagger.tags = ['Super Admin']
  superAdminController.onboardClinic(req, res, next);
});

router.patch('/clinics/:clinicId/status', (req, res, next) => {
  // #swagger.tags = ['Super Admin']
  superAdminController.updateClinicStatus(req, res, next);
});

router.post('/subscriptions', (req, res, next) => {
  // #swagger.tags = ['Super Admin']
  superAdminController.saveSubscriptionPlan(req, res, next);
});

router.patch('/users/:userId/status', (req, res, next) => {
  // #swagger.tags = ['Super Admin']
  superAdminController.toggleUserStatus(req, res, next);
});

// Get all registered platform users
router.get('/users', (req, res, next) => {
  // #swagger.tags = ['Super Admin']
  superAdminController.getAllPlatformUsers(req, res, next);
});

//  Revenue & Tier Breakdown Stats
router.get('/revenue-reports', (req, res, next) => {
  // #swagger.tags = ['Super Admin']
  superAdminController.getRevenueReports(req, res, next);
});

// Full Platform Audit CSV Download
router.get('/export-csv', (req, res, next) => {
  // #swagger.tags = ['Super Admin']
  superAdminController.exportRevenueCSV(req, res, next);
});

// System Settings Routes 
router.get('/settings', (req, res, next) => {
  // #swagger.tags = ['Super Admin']
  superAdminController.getSystemSettings(req, res, next);
});

router.patch('/settings', (req, res, next) => {
  // #swagger.tags = ['Super Admin']
  superAdminController.updateSystemSettings(req, res, next);
});
module.exports = router;