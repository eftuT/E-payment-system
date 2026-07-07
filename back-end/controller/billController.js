const asyncHandler = require('express-async-handler');
const db = require('../models');
const { ServiceProviders, Payment, User, Bill } = require('../models');

// Create and save a new bill
exports.create = asyncHandler(async (req, res) => {
  // Validate request
  const requiredFields = [
    'billNumber',
    'dateIssued',
    'dueDate',
    'amountDue',
    'serviceDescription',
    'serviceCharges',
    'billStatus',
  ];


  // Check if field exists
  const missingFields = requiredFields.filter((field) => !req.body[field]);

  //if field is empty send an error message
  if (missingFields.length > 0) {
    res.status(400).send({
      message: `${missingFields.join(', ')} cannot be empty`,
    });
    return;
  }
  //calculate the total amount
  const totalAmount = calculateTotalAmount(req.body);

  try {
    let customerName = req.body.customerName; // Default to req.body value

    // Create the bill
    const bill = {
      billNumber: req.body.billNumber,
      dateIssued: req.body.dateIssued,
      dueDate: req.body.dueDate,
      amountDue: parseFloat(req.body.amountDue),
      customerName: customerName,
      serviceDescription: req.body.serviceDescription,
      serviceCharges: parseFloat(req.body.serviceCharges),
      billStatus: req.body.billStatus,
      additionalCharges: parseFloat(req.body.additionalCharges || 0),
      servicePeriod: req.body.servicePeriod,
      TotalAmount: totalAmount,
      UserId: req.body.UserId,
      serviceProviderBIN: req.body.serviceProviderBIN,
      PaymentId: req.body.PaymentId,
    };

    // Check if UserId is provided
    if (req.body.UserId) {
      // Retrieve the associated user
      const user = await User.findByPk(req.body.UserId);

      if (!user) {
        res.status(404).send({
          message: `User with id=${req.body.UserId} not found`,
        });
        return;
      }
      //set the customer name to the user's name
      bill.customerName = user.FirstName + ' ' + user.LastName; // Use the associated user's name
    }

    // Check if serviceProviderBIN is provided
    if (req.body.serviceProviderBIN) {
      const serviceProvider = await ServiceProviders.findByPk(req.body.serviceProviderBIN);
      if (!serviceProvider) {
        res.status(404).send({
          message: `Service provider with id=${req.body.serviceProviderBIN} not found`,
        });
        return;
      }

      // Associate the service provider with the bill
      bill.ServiceProviderServiceProviderBIN = serviceProvider.serviceProviderBIN;
    }

    const data = await Bill.create(bill, {
      include: [
        {
          model: ServiceProviders,
          as: 'ServiceProvider',
          attributes: ['serviceProviderBIN', 'serviceProviderName'],
        },
        {
          model: Payment,
          as: 'Payment',
        },
        {
          model: User,
          as: 'User',
          attributes: ['UserID', 'UserName', 'Email'],
        },
      ],
    });

    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: 'Error creating the bill.',
    });
  }
});

// Retrieve all bills from the database
exports.findAll = asyncHandler(async (req, res) => {
  try {
    const data = await Bill.findAll({
      include: [
        {
          model: User,
          as: 'User',
          attributes: [], // Exclude User attributes from the result
        },
        {
          model: ServiceProviders,
          as: 'ServiceProvider',
          attributes: [],
        },
      ],
    });

    if (data) {
      // The bill with the specified conditions was found
      console.log(data);
    }


    if (!data) {
      res.status(404).send({
        message: `Bill with id=${id} not found`,
      });
      return;
    }
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: 'Error retrieving bills.',
    });
  }
});

//find bill by id
exports.findOne = asyncHandler(async (req, res) => {
  const userId = req.query.userId;
  const serviceProviderBIN = req.query.serviceProviderBIN;

  const data = await Bill.findOne({
    include: [
      {
        model: User,
        as: 'User',
        where: { id: userId },
        attributes: [],
      },
      {
        model: ServiceProviders,
        as: 'ServiceProvider',
        where: { serviceProviderBIN: serviceProviderBIN },
        attributes: [],
      },
    ],
    where: { billStatus: "Unpaid" }
  });

  if (!data) {
    res.status(404).send({
      message: `Bill not found for userId=${userId} and serviceProviderBIN=${serviceProviderBIN}`,
    });
    return;
  }

  res.send(data);
});

// Update a bill by id
exports.update = asyncHandler(async (req, res) => {
  const id = req.params.id;

  // Check if Bill exists with the provided ID
  const existingBill = await Bill.findByPk(id);
  if (!existingBill) {
    res.status(404).send({
      message: `Bill with id=${id} not found`,
    });
    return;
  }

  // Update the bill data
  existingBill.UserId = req.body.UserId;
  existingBill.serviceProviderBIN = req.body.serviceProviderBIN;

  // Check if UserID is provided
  if (existingBill.UserId) {
    const user = await User.findByPk(existingBill.UserId);
    if (user) {
      const name = `${user.FirstName} ${user.LastName}`;
      existingBill.customerName = name;
    } else {
      res.status(404).send({
        message: `User with id=${existingBill.UserId} not found`,
      });
      return;
    }
  }


  // Check if serviceProviderBIN is provided
  if (req.body.serviceProviderBIN) {
    const serviceProvider = await ServiceProviders.findByPk(req.body.serviceProviderBIN);
    if (!serviceProvider) {
      res.status(404).send({
        message: `Service provider with id=${req.body.serviceProviderBIN} not found`,
      });
      return;
    }

    // Associate the service provider with the bill
    existingBill.ServiceProviderServiceProviderBIN = serviceProvider.serviceProviderBIN;
  }

  // Check if paymentId is provided
  if (req.body.PaymentId) {
    const payment = await Payment.findByPk(req.body.PaymentId);
    if (!payment) {
      res.status(404).send({
        message: `Payment with id=${req.body.PaymentId} not found`,
      });
      return;
    }

    // Associate the payment with the bill
    existingBill.PaymentId = payment.id;
  }

  // Update other bill fields if needed
  updateBillFields(existingBill, req.body);

  // Recalculate the total amount
  existingBill.TotalAmount = calculateTotalAmount(existingBill);

  // Save the updated bill
  await existingBill.save();

  res.send({
    message: 'Bill was updated successfully.',
  });
});

// Delete a bill by id
exports.delete = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const num = await Bill.destroy({
    where: { id: id },
  });

  if (num === 1) {
    res.send({
      message: 'Bill was deleted successfully!',
    });
  } else {
    res.send({
      message: `Cannot delete bill with id=${id}. Bill not found!`,
    });
  }
});

// Helper function to calculate the total amount
function calculateTotalAmount(bill) {
  const serviceCharges = parseFloat(bill.serviceCharges);
  const amountDue = parseFloat(bill.amountDue);
  const additionalCharges = parseFloat(bill.additionalCharges || 0);

  return (serviceCharges + amountDue + additionalCharges).toFixed(2);
}

async function updateBillFields(bill, updateData) {
  const fieldsToUpdate = [
    'billNumber',
    'dateIssued',
    'dueDate',
    'amountDue',
    'customerName',
    'serviceDescription',
    'serviceCharges',
    'billStatus',
    'additionalCharges',
    'servicePeriod',
  ];
  console.log(bill.CustomerName);

  fieldsToUpdate.forEach((field) => {
    bill[field] = updateData[field] || bill[field];
  });
}