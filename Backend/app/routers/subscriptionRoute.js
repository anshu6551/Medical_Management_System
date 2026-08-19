const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const AuthCheck = require("../middlewares/AuthMiddleware");
const authorizeRoles = require("../middlewares/RoleMiddleware");

// Sabhi routes par Token Authentication enforce karo
router.use(AuthCheck);

// 1. Create Subscription Plan (Super Admin Only)
router.post("/", authorizeRoles("SUPER_ADMIN"), (req, res, next) => {
  // #swagger.tags = ['Super Admin - Subscriptions']
  subscriptionController.createSubscription(req, res, next);
});

// 2. Get All Subscription Plans (Super Admin & Clinic Admin donok dekh sakein)
router.get("/", authorizeRoles("SUPER_ADMIN", "CLINIC_ADMIN"), (req, res, next) => {
  // #swagger.tags = ['Super Admin - Subscriptions']
  subscriptionController.getAllSubscriptions(req, res, next);
});

// 3. Update Subscription Plan (Super Admin Only)
router.put("/:planId", authorizeRoles("SUPER_ADMIN"), (req, res, next) => {
  // #swagger.tags = ['Super Admin - Subscriptions']
  subscriptionController.updateSubscription(req, res, next);
});

module.exports = router;