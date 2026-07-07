const express = require('express');
const adminActivityController = require('../controller/adminActivityController');

const router = express.Router();

// Create a new admin activity
router.post('/', adminActivityController.createAdminActivity);

// Get all admin activities
router.get('/', adminActivityController.getAllAdminActivities);

module.exports = router;

