const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { Op } = require('sequelize');

// Admin Login Controller
async function adminLogin(req, res) {
  // Validate request
  const { identifier, Password } = req.body;

  if (!identifier || !Password) {
    res.status(400).send({
      message: 'Username/Email and password are required',
    });
    return;
  }

  try {

    // Find the user by email or username
    const user = await User.findOne({
      Role: {
        [Op.in]: ['Admin', 'SuperAdmin']
      },
      where: {
        [Op.or]: [{ Email: identifier }, { UserName: identifier }],
      }
    });

    if (!user) {
      res.status(404).send({
        message: 'User not found',
      });
      return;
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(Password, user.Password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    // Generate JWT token
    const token = jwt.sign({ userId: user.UserID }, 'super_secret_key_1234', { expiresIn: '1h' });

    res.json({
      message: 'Login successful',
      token: token,
      user: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
    next(createError(500, 'Internal server error'));
  }
}

module.exports = {
  adminLogin,
};