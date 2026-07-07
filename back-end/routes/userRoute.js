const express = require('express');
const router = express.Router();
const UserController = require('../controller/UserController.js');

// ============================================
// TEST ROUTES
// ============================================
router.get('/test-jwt', UserController.testJWT);

router.post('/test', (req, res) => {
  console.log('✅ Test POST received:', req.body);
  res.json({
    success: true,
    message: 'POST is working!',
    receivedData: req.body
  });
});

// ============================================
// AUTHENTICATION ROUTES
// ============================================
router.post('/login', UserController.login);
router.post('/requestPasswordReset', UserController.requestPasswordReset);
router.post('/verifyResetToken/:token', UserController.verifyResetToken);
router.post('/updatePasswordWithToken', UserController.updatePasswordWithToken);
router.post('/verifyUser/:userId/:verificationCode', UserController.verifyUser);

// ============================================
// USER MANAGEMENT ROUTES
// ============================================
router.post('/', UserController.upload, UserController.create);
router.get('/', UserController.findAll);
router.get('/:id', UserController.findOne);
router.get('/serviceNo/:serviceNo/:serviceProviderBIN', UserController.findOneByServiceNo);
router.put('/:id', UserController.upload, UserController.update);
router.delete('/:id', UserController.delete);
router.post('/associate', UserController.associate);

// ============================================
// DATABASE TEST ROUTE
// ============================================
router.get('/test-db', async (req, res) => {
  try {
    const db = require('../models');
    await db.sequelize.authenticate();
    const count = await db.User.count();
    res.json({
      success: true,
      message: 'Database connected',
      userCount: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;