const asyncHandler = require('express-async-handler');
const db = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');

const fs = require('fs');
const { Agents, ServiceProviders, User, Payment } = require('../models');

exports.create = asyncHandler(async (req, res) => {
  //validate fields
  const requiredFields = [
    'agentBIN',
    'agentName',
    'agentEmail',
    'servicesOffered',
    'phoneNumber',
  ];

  const missingFields = requiredFields.filter((field) => !req.body[field]);

  // Check if agentAuthorizationLetter field exists
  if (!req.file || !req.file.path) {
    missingFields.push('agentAuthorizationLetter');
  }
  //if field is empty send an error message
  if (missingFields.length > 0) {
    res.status(400).send({
      message: `${missingFields.join(', ')} cannot be empty`,
    });
    return;

  }
  try {
    const {
      agentBIN,
      agentName,
      agentEmail,
      servicesOffered,
      phoneNumber,
      serviceProviderBIN, // Assuming you have the ID of the associated service provider
      UserId, // Assuming you have the ID of the associated user
      paymentId, // Assuming you have the ID of the associated payment
    } = req.body;

    // Check if agent already exists
    const existingAgent = await Agents.findOne({
      where: {
        agentBIN: agentBIN,
      },
    });
    // If agent exists send an error message
    if (existingAgent) {
      return res.status(409).json({
        error: 'Agent already exists',
      });
    }

    // Check if agentAuthorizationLetter field exists and if empty send error message
    if (!req.file || !req.file.path) {
      return res.status(400).json({
        error: 'Agent authorization letter is required',
      });
    }

    // Create the agent
    const agent = await Agents.create({
      agentBIN,
      agentName,
      agentEmail,
      servicesOffered,
      phoneNumber,
      agentAuthorizationLetter: req.file.path,
      serviceProviderBIN,
      UserId,
      paymentId,
    });

    // Associate with ServiceProviders
    if (req.body.serviceProviderBINs && req.body.serviceProviderBINs.length > 0) {
      const serviceProviders = await ServiceProviders.findAll({
        where: {
          id: {
            [Op.in]: req.body.serviceProviderBINs,
          },
        },
      });
      await agent.setServiceProviders(serviceProviders);
    }

    // Associate with Payment
    if (req.body.paymentIds && req.body.paymentIds.length > 0) {
      const payments = await Payment.findAll({
        where: {
          id: {
            [Op.in]: req.body.paymentIds,
          },
        },
      });
      await agent.setPayments(payments);
    }

    // Associate with User
    if (req.body.userIds && req.body.userIds.length > 0) {
      const users = await User.findAll({
        where: {
          id: {
            [Op.in]: req.body.userIds,
          },
        },
      });
      await agent.setUsers(users);
    }

    // Fetch the agent with associated models
    const data = await Agents.findByPk(agent.agentBIN, {
      include: [
        {
          model: ServiceProviders,
          as: 'ServiceProviders',
        },
        {
          model: User,
          as: 'User',
        },
        {
          model: Payment,
          as: 'Payments',
        },
      ],
    });

    return res.send(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Server error',
    });
  }
});

// Update an agent
exports.update = asyncHandler(async (req, res) => {
  try {
    const agentId = req.params.id;
    const {
      agentBIN,
      agentName,
      agentEmail,
      servicesOffered,
      phoneNumber,
    } = req.body;

    // if agent doesnot exist send an error message
    const agent = await Agents.findByPk(agentId);
    if (!agent) {
      return res.status(404).json({
        error: 'Agent not found',
      });
    }

    agent.agentBIN = agentBIN;
    agent.agentName = agentName;
    agent.agentEmail = agentEmail;
    agent.servicesOffered = servicesOffered;
    agent.phoneNumber = phoneNumber;

    // Check if a new file is uploaded
    if (req.file && req.file.path) {
      // Delete the previous authorization letter file
      if (agent.agentAuthorizationLetter) {
        fs.unlinkSync(agent.agentAuthorizationLetter);
      }
      agent.agentAuthorizationLetter = req.file.path;
    }

    await agent.save();

    // Associate with service provider
    if (req.body.serviceProviderBINs && req.body.serviceProviderBINs.length > 0) {
      const serviceProvider = await ServiceProviders.findAll({
        where: {
          id: {
            [Op.in]: req.body.serviceProviderBINs,
          },
        },
      });
      if (serviceProvider) {
        await agent.setServiceProviders(serviceProvider);
      }
    }

    // Associate with payment
    if (req.body.paymentIds && req.body.paymentIds.length > 0) {
      const payment = await Payment.findAll({
        where: {
          id: {
            [Op.in]: req.body.paymentIds,
          },
        },
      });
      if (payment) {
        await agent.addpayment(payment);
      }
    }


    // Associate with User
    if (req.body.UserIds && req.body.UserIds.length > 0) {
      const user = await User.findAll({
        where: {
          id: {
            [Op.in]: req.body.UserIds,
          },
        },
      });
      if (user) {
        await agent.addUser(user);
      }
    }



    return res.send(agent);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Server error',
    });
  }
});

// Get all agents
exports.findAll = asyncHandler(async (req, res) => {
  try {
    const agents = await Agents.findAll({
      include: [
        {
          model: ServiceProviders,
          as: 'ServiceProviders',
        },
        {
          model: User,
          as: 'User',
        },
        {
          model: Payment,
          as: 'Payments',
        },
      ],
    });

    return res.send(agents);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Server error',
    });
  }
});

// Get agent by ID
exports.findOne = asyncHandler(async (req, res) => {
  try {
    const agentId = req.params.id;

    const agent = await Agents.findByPk(agentId, {
      include: [
        {
          model: ServiceProviders,
          as: 'ServiceProviders',
        },
        {
          model: User,
          as: 'User',
        },
        {
          model: Payment,
          as: 'Payments',
        },
      ],
    });

    if (!agent) {
      return res.status(404).json({
        error: 'Agent not found',
      });
    }

    return res.send(agent);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Server error',
    });
  }
});

// Delete an agent
exports.delete = asyncHandler(async (req, res) => {
  try {
    const agentId = req.params.id;

    const agent = await Agents.findByPk(agentId);
    if (!agent) {
      return res.status(404).json({
        error: 'Agent not found',
      });
    }

    // Disassociate the agent from the service provider, user, and payment
    await agent.setServiceProviders(null);
    await agent.setUser(null);
    await agent.setPayments(null);

    // Delete the agent
    await agent.destroy();

    return res.status(200).json({
      message: 'Agent deleted successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Server error',
    });
  }
});


// Upload image using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

exports.upload = multer({
  storage: storage,
  limits: { fileSize: '1000000' },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimeType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));
    if (mimeType && extname) {
      return cb(null, true);
    }
    cb('Provide the proper format');
  },
}).single('agentAuthorizationLetter');