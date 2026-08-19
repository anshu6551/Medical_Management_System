const express = require('express');
const router = express.Router();

const authRoute = require('./authRouter');
const superAdminRoute = require('./superAdminRouter');
const clinicRoute = require('./clinicRouter');
const doctorRoute = require('./doctorRouter');
const patientRoute = require('./patientRouter');
const subscriptionRoute = require('./subscriptionRoute');

// Sub-routes Aggregation
router.use('/auth', authRoute);
router.use('/super-admin', superAdminRoute);
router.use('/clinic', clinicRoute);
router.use('/subscription', subscriptionRoute);
router.use('/doctor', doctorRoute);
router.use('/patient', patientRoute);

module.exports = router;