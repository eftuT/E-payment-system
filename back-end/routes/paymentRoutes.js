const express = require('express');
const paymentController = require('../controller/PaymentController.js');

const paymentRouter = express.Router();

// Define routes for payment resource
paymentRouter.post('/', paymentController.create);
paymentRouter.get('/', paymentController.findAll);
paymentRouter.get('/:id', paymentController.findOne);
paymentRouter.put('/:id', paymentController.update);
paymentRouter.delete('/:id', paymentController.delete);

module.exports = paymentRouter;