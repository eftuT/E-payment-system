require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET not found, setting fallback');
  process.env.JWT_SECRET = 'fallback_secret_key_for_development_only';
}

const asyncHandler = require('express-async-handler');
const db = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

const { User, Payment, Bill, Agents, ServiceProviders, UserServiceProvider } = require('../models');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

exports.upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimeType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));
    if (mimeType && extname) {
      return cb(null, true);
    }
    cb(new Error('Please provide a valid image format (jpeg, jpg, png, gif)'));
  }
}).single('ProfilePicture');

function getDefaultIncludes() {
  return [
    {
      model: ServiceProviders,
      as: 'ServiceProviders',
      through: { attributes: ['serviceNo'] }
    },
    {
      model: Payment,
      as: 'Payments',
    },
    {
      model: Bill,
      as: 'Bills',
    },
    {
      model: Agents,
      as: 'Agents',
    },
  ];
}

function getJWTSecret() {
  return process.env.JWT_SECRET || 'fallback_secret_key_for_development_only';
}

exports.login = async (req, res) => {
  try {
    const { identifier, Password } = req.body;

    if (!identifier || !Password) {
      return res.status(400).json({
        success: false,
        message: 'Username/Email and password are required',
      });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { Email: identifier },
          { UserName: identifier }
        ],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isPasswordValid = await bcrypt.compare(Password, user.Password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password',
      });
    }

    const secret = getJWTSecret();
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.Email, 
        role: user.Role,
        userName: user.UserName
      },
      secret,
      { expiresIn: '24h' }
    );

    let userData = {
      id: user.id,
      UserID: user.UserID,
      FirstName: user.FirstName,
      LastName: user.LastName,
      Email: user.Email,
      UserName: user.UserName,
      Role: user.Role,
      PhoneNumber: user.PhoneNumber,
      Address: user.Address,
      ProfilePicture: user.ProfilePicture,
    };

    try {
      const userWithAssociations = await User.findByPk(user.id, {
        include: getDefaultIncludes()
      });
      
      if (userWithAssociations) {
        userData = {
          ...userData,
          ServiceProviders: userWithAssociations.ServiceProviders || [],
          Payments: userWithAssociations.Payments || [],
          Bills: userWithAssociations.Bills || [],
          Agents: userWithAssociations.Agents || []
        };
      }
    } catch (assocError) {
      userData.ServiceProviders = [];
      userData.Payments = [];
      userData.Bills = [];
      userData.Agents = [];
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: token,
      user: userData,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

exports.create = asyncHandler(async (req, res) => {
  const requiredFields = [
    'UserID',
    'FirstName',
    'LastName',
    'Gender',
    'UserName',
    'Email',
    'Password',
    'PhoneNumber',
    'Address',
  ];

  const missingFields = requiredFields.filter((field) => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `${missingFields.join(', ')} cannot be empty`,
    });
  }

  try {
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { Email: req.body.Email },
          { UserName: req.body.UserName },
          { UserID: req.body.UserID }
        ]
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this Email, Username, or UserID',
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.Password, 10);

    const userData = {
      UserID: req.body.UserID,
      FirstName: req.body.FirstName,
      LastName: req.body.LastName,
      Gender: req.body.Gender,
      UserName: req.body.UserName,
      Password: hashedPassword,
      Email: req.body.Email,
      PhoneNumber: req.body.PhoneNumber,
      Address: req.body.Address,
      Role: req.body.Role || 'User',
      ProfilePicture: req.file ? req.file.path : null,
    };

    const createdUser = await User.create(userData);

    const userWithAssociations = await User.findByPk(createdUser.id, {
      include: getDefaultIncludes()
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userWithAssociations
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message,
    });
  }
});

exports.findAll = asyncHandler(async (req, res) => {
  try {
    const users = await User.findAll({
      include: getDefaultIncludes(),
    });
    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: error.message,
    });
  }
});

exports.findOne = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByPk(id, {
      include: getDefaultIncludes(),
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with id=${id} not found`,
      });
    }
    
    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving user',
      error: error.message,
    });
  }
});

// ==========================================
// FIXED: This controller will no longer 
// clash with getDefaultIncludes()
// ==========================================
exports.findOneByServiceNo = asyncHandler(async (req, res) => {
  const serviceNo = req.params.serviceNo;
  const serviceProviderBIN = req.params.serviceProviderBIN;

  try {
    const user = await db.User.findOne({
      include: [
        {
          model: db.ServiceProviders,
          as: 'ServiceProviders',
          required: true,
          where: {
            serviceProviderBIN: serviceProviderBIN
          },
          through: {
            model: db.UserServiceProvider,
            as: 'userServiceProvider',
            where: {
              serviceNo: serviceNo
            },
          },
        },
        // Manually declaring these to prevent overlap
        { model: db.Payment, as: 'Payments' },
        { model: db.Bill, as: 'Bills' },
        { model: db.Agents, as: 'Agents' },
      ],
      distinct: true
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

exports.update = asyncHandler(async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with id=${id} not found`,
      });
    }

    const updateData = {
      FirstName: req.body.FirstName || user.FirstName,
      LastName: req.body.LastName || user.LastName,
      Gender: req.body.Gender || user.Gender,
      UserName: req.body.UserName || user.UserName,
      Email: req.body.Email || user.Email,
      PhoneNumber: req.body.PhoneNumber || user.PhoneNumber,
      Address: req.body.Address || user.Address,
      Role: req.body.Role || user.Role,
    };

    if (req.file) {
      updateData.ProfilePicture = req.file.path;
    }

    if (req.body.Password) {
      updateData.Password = await bcrypt.hash(req.body.Password, 10);
    }

    await user.update(updateData);

    const updatedUser = await User.findByPk(id, {
      include: getDefaultIncludes()
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message,
    });
  }
});

exports.delete = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const num = await User.destroy({
    where: { id: id },
  });

  if (num === 1) {
    res.json({
      success: true,
      message: 'User deleted successfully!',
    });
  } else {
    res.status(404).json({
      success: false,
      message: `Cannot delete user with id=${id}. User not found!`,
    });
  }
});

exports.associate = asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({
      where: { UserID: req.body.UserID },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (req.body.serviceProviderBINs && req.body.serviceProviderBINs.length > 0) {
      const serviceProviderBINs = req.body.serviceProviderBINs;
      const serviceProviders = await ServiceProviders.findAll({
        where: {
          serviceProviderBIN: {
            [Op.in]: serviceProviderBINs,
          },
        },
      });

      if (serviceProviders.length !== serviceProviderBINs.length) {
        return res.status(404).json({
          success: false,
          message: 'Some service providers not found',
        });
      }

      for (let i = 0; i < serviceProviders.length; i++) {
        const serviceNo = Math.floor(100000 + Math.random() * 900000);
        await user.addServiceProviders(serviceProviders[i], {
          through: { serviceNo: serviceNo },
        });
      }

      const associatedUser = await User.findOne({
        where: { UserID: req.body.UserID },
        include: getDefaultIncludes()
      });

      res.json({
        success: true,
        message: 'Associations created successfully',
        user: associatedUser,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'No service providers provided',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error associating user with service providers',
      error: error.message
    });
  }
});

exports.requestPasswordReset = asyncHandler(async (req, res) => {
  if (!req.body.Email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });
  }

  const user = await User.findOne({
    where: { Email: req.body.Email },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  const resetToken = uuidv4();
  const resetTokenExpiration = Date.now() + 3600000;

  user.resetToken = resetToken;
  user.resetTokenExpiration = resetTokenExpiration;
  await user.save();

  const resetLink = `http://localhost:3001/Users/UpdatePassword#/${resetToken}`;
  const message = `Dear ${user.FirstName},\n\nWe received a request to reset your password.\n\nTo reset your password, click on the following link:\n${resetLink}\n\nIf you did not request a password reset, please ignore this email.\n\nBest regards,\nYourApp Team`;

  await sendEmail(req.body.Email, 'Password Reset Request', message);

  res.json({
    success: true,
    message: 'Password reset email sent',
  });
});

exports.verifyResetToken = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    where: {
      resetToken: token,
      resetTokenExpiration: { [Op.gt]: Date.now() },
    },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }

  res.json({
    success: true,
    message: 'Token is valid'
  });
});

exports.updatePasswordWithToken = asyncHandler(async (req, res) => {
  const { Email, Password } = req.body;

  if (!Email || !Password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }

  const user = await User.findOne({
    where: { Email: Email },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      error: 'User not found'
    });
  }

  const hashedPassword = await bcrypt.hash(Password, 10);

  user.Password = hashedPassword;
  user.resetToken = null;
  user.resetTokenExpiration = null;
  await user.save();

  res.json({
    success: true,
    message: 'Password updated successfully'
  });
});

exports.verifyUser = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const verificationCode = req.params.verificationCode;

  if (!userId || !verificationCode) {
    return res.status(400).json({
      success: false,
      message: 'User ID and verification code are required',
    });
  }

  const user = await User.findByPk(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  const message = `Dear ${user.FirstName},\n\nYour verification code is: ${verificationCode}\n\nPlease use this code to verify your email.\n\nBest regards,\nYourApp Team`;

  await sendEmail(user.Email, 'Email Verification', message);

  res.json({
    success: true,
    message: 'Verification email sent successfully',
  });
});

exports.testJWT = async (req, res) => {
  try {
    const secret = getJWTSecret();
    const token = jwt.sign(
      { test: 'data', timestamp: Date.now() },
      secret,
      { expiresIn: '1h' }
    );
    
    res.json({
      success: true,
      message: 'JWT is working!',
      secret_available: !!process.env.JWT_SECRET,
      token: token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

async function sendEmail(recipientEmail, subject, message) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || "eftutesfaye357@gmail.com",
        pass: process.env.EMAIL_PASS || "clnyfngaveyvxucx",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER || "eftutesfaye357@gmail.com",
      to: recipientEmail,
      subject: subject,
      text: message,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw error;
  }
}