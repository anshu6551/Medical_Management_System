const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', (req, res, next) => {
  // #swagger.tags = ['Authentication']
  authController.register(req, res, next);
});

router.get('/verify-email', (req, res, next) => {
  // #swagger.tags = ['Authentication']
  authController.verifyEmail(req, res, next);
});

router.post('/login', (req, res, next) => {
  // #swagger.tags = ['Authentication']
  authController.login(req, res, next);
});

module.exports = router;