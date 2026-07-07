const express = require('express');
const router = express.Router();
const { adminLogin } = require('../controller/AdminLoginController.js');

// Admin login route
router.post('/login', adminLogin);


module.exports = router;