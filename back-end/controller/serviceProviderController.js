const asyncHandler = require('express-async-handler');
const db = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');

const fs = require('fs');
const { Agents, ServiceProviders, User, Payment, Bill } = require('../models');

exports.create = asyncHandler(async (req, res) => {
  // validate
  const requiredFields = [
    'serviceProviderBIN',
    'serviceProviderName',
    'servicesOffered',
    'BankName',
    'BankAccountNumber',
    'phoneNumber',
  ];

  const missingFields = requiredFields.filter((field) => !req.body[field]);

  // Check if serviceProviderAuthorizationLetter field exists
  if (!req.file || !req.file.path) {
    missingFields.push('serviceProviderAuthorizationLetter');
  }

  if (missingFields.length > 0) {
    res.status(400).send({
      message: `${missingFields.join(', ')} cannot be empty`,
    });
    return;
  }

  try {
    const {
      serviceProviderBIN,
      serviceProviderName,
      servicesOffered,
      BankName,
      BankAccountNumber,
      phoneNumber,
    } = req.body;

    // Check if service provider already exists
    const existingServiceProvider = await ServiceProviders.findOne({
      where: {
        serviceProviderBIN: serviceProviderBIN,
      },
    });

    if (existingServiceProvider) {
      return res.status(409).json({
        error: 'Service provider already exists',
      });
    }

    // Check if serviceProviderAuthorizationLetter field exists
    if (!req.file || !req.file.path) {
      return res.status(400).json({
        error: 'Service provider authorization letter is required',
      });
    }

    // Create the service provider
    const serviceProvider = await ServiceProviders.create({
      serviceProviderBIN,
      serviceProviderName,
      servicesOffered,
      BankName,
      BankAccountNumber,
      phoneNumber,
      serviceProviderAuthorizationLetter: req.file.path,
    });

    // Find the existing agent by agentBIN
    if (req.body.agentBIN) {
      const agentBIN = req.body.agentBIN; // Assuming the agentBIN is provided in the request body
      const agent = await Agents.findByPk(agentBIN);
      if (!agent) {
        return res.status(404).json({
          error: 'Agent not found',
        });
      }
      //Associate with Agent
      await serviceProvider.addAgents(agent);
    }

    // Find the existing agent by UserId
    if (req.body.UserID) {
      const UserID = req.body.UserID; // Assuming the UserId is provided in the request body
      const user = await User.findByPk(UserID);
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
        });
      }
      //Associate with User
      await serviceProvider.addUsers(user);
    }

    // Find the existing bill by billId
    if (req.body.billId) {
      const billId = req.body.billId; // Assuming the billId is provided in the request body
      const bill = await Bill.findByPk(billId);
      if (!bill) {
        return res.status(404).json({
          error: 'Bill not found',
        });
      }
      //Associate with ServiceProvider
      await serviceProvider.addBills(bill);
    }

    // Find the existing agent by paymentId
    if (req.body.PaymentId) {
      const PaymentId = req.body.PaymentId; // Assuming the paymentId is provided in the request body
      const payment = await Payment.findByPk(PaymentId);
      if (!Payment) {
        return res.status(404).json({
          error: 'Payment not found',
        });
      }
      //Associate with Payment
      await serviceProvider.addPayments(payment);
    }

    return res.send({
      message: 'Service provider was created successfully.',
      serviceProvider,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Server error',
    });
  }
});

// Update a service provider
exports.update = asyncHandler(async (req, res) => {
  try {
    const serviceProviderId = req.params.id;
    const {
      serviceProviderBIN,
      serviceProviderName,
      servicesOffered,
      BankName,
      BankAccountNumber,
      phoneNumber,
    } = req.body;

    const serviceProvider = await ServiceProviders.findByPk(serviceProviderId);
    if (!serviceProvider) {
      return res.status(404).json({
        error: 'Service provider not found',
      });
    }

    serviceProvider.serviceProviderBIN = serviceProviderBIN;
    serviceProvider.serviceProviderName = serviceProviderName;
    serviceProvider.servicesOffered = servicesOffered;
    serviceProvider.BankName = BankName;
    serviceProvider.BankAccountNumber = BankAccountNumber;
    serviceProvider.phoneNumber = phoneNumber;

    // Check if a new file is uploaded
    if (req.file && req.file.path) {
      // Delete the previous authorization letter file
      if (serviceProvider.serviceProviderAuthorizationLetter) {
        fs.unlinkSync(serviceProvider.serviceProviderAuthorizationLetter);
      }
      serviceProvider.serviceProviderAuthorizationLetter = req.file.path;
    }

    await serviceProvider.save();

    // Update the associations with the agent and the Agent
    if (req.body.agentBINs && req.body.agentBINs.length > 0) {
      const agents = await Agents.findAll({
        where: {
          id: {
            [Op.in]: req.body.agentBINs,
          },
        },
      });
      if (!agents) {
        return res.status(404).json({
          error: 'Agent not found',
        });
      }
      // Associate the service provider with the Agent
      serviceProvider.agentBIN = agents.agentBIN;
    }

    // Update the associations with the agent and the bill
    if (req.body.billIds && req.body.billIds.length > 0) {
      const bill = await Bill.findAll({
        where: {
          id: {
            [Op.in]: req.body.billIds,
          },
        },
      });
      if (!bill) {
        return res.status(404).json({
          error: 'Agent not found',
        });
      }
      // Associate the service provider with the bill
      serviceProvider.billId = bill.billId;
    }

    // Update the associations with the agent and the User
    if (req.body.UserIds && req.body.UserIds.length > 0) {
      const user = await User.findAll({
        where: {
          id: {
            [Op.in]: req.body.UserIds,
          },
        },
      });
      if (!user) {
        return res.status(404).json({
          error: 'user not found',
        });
      }
      // Associate the service provider with the user
      serviceProvider.UserID = user.UserID;
    }

    // Update the associations with the agent and the bill
    if (req.body.PaymentIds && req.body.PaymentIds.length > 0) {
      const payment = await Payment.findAll({
        where: {
          id: {
            [Op.in]: req.body.PaymentIds,
          },
        },
      });
      if (!payment) {
        return res.status(404).json({
          error: 'Payment not found',
        });
      }
      // Associate the service provider with the payment
      serviceProvider.PaymentId = payment.PaymentId;
    }


    // Remove associations with payment
    if (req.body.removePaymentIds && req.body.removePaymentIds.length > 0) {
      const payment = await Payment.findAll({
        where: {
          id: {
            [Op.in]: req.body.removePaymentIds,
          },
        },
      });
      if (payment) {
        await serviceProvider.removepayment(payment);
      }
    }

    // Remove associations with the user
    if (req.body.removeUserIds && req.body.removeUserIds.length > 0) {
      const user = await User.findAll({
        where: {
          id: {
            [Op.in]: req.body.removeUserIds,
          },
        },
      });
      if (user) {
        await serviceProvider.removeUser(user);
      }
    }

    // Remove associations with the bill
    if (req.body.removeBillIds && req.body.removeBillIds.length > 0) {
      const bills = await Bill.findAll({
        where: {
          id: {
            [Op.in]: req.body.removeBillIds,
          },
        },
      });
      if (bills) {
        await serviceProvider.removeBill(bills);
      }
    }

    // Remove associations with the agents
    if (req.body.removeAgentIds && req.body.removeAgentIds.length > 0) {
      const agents = await Agents.findAll({
        where: {
          id: {
            [Op.in]: req.body.removeAgentIds,
          },
        },
      });
      if (agents) {
        await serviceProvider.removeAgents(agents);
      }
    }

    // Save the updated bill
    await serviceProvider.save();


    return res.status(200).json({
      message: 'Service provider was updated successfully.',
      serviceProvider,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Server error',
    });
  }
});


// Get all service providers
exports.findAll = asyncHandler(async (req, res) => {
  try {
    const serviceProviders = await ServiceProviders.findAll({
      include: [
        {
          model: Agents,
          as: 'Agents',
        },
        {
          model: Bill,
          as: 'Bills',
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

    return res.send(serviceProviders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Server error',
    });
  }
});

// Get service provider by ID
exports.findOne = asyncHandler(async (req, res) => {
  try {
    const serviceProviderId = req.params.id;

    const serviceProvider = await ServiceProviders.findByPk(serviceProviderId, {
      include: [
        {
          model: Agents,
          as: 'Agents',
        },
        {
          model: Bill,
          as: 'Bills',
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

    if (!serviceProvider) {
      return res.status(404).json({
        error: 'Service provider not found',
      });
    }

    return res.status(200).json({
      serviceProvider,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Server error',
    });
  }
});

// Delete a service provider
exports.delete = asyncHandler(async (req, res) => {
  try {
    const serviceProviderId = req.params.id;

    const serviceProvider = await ServiceProviders.findByPk(serviceProviderId);

    if (!serviceProvider) {
      return res.status(404).json({
        error: 'Service provider not found',
      });
    }

    // Delete the authorization letter file
    if (serviceProvider.serviceProviderAuthorizationLetter) {
      fs.unlinkSync(serviceProvider.serviceProviderAuthorizationLetter);
    }

    await serviceProvider.destroy();

    return res.status(200).json({
      message: 'Service provider deleted successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Server error',
    });
  }
});

// Upload image
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
}).single('serviceProviderAuthorizationLetter');