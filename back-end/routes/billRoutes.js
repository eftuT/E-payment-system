const express = require('express');
const billsRouter = express.Router();

const billController = require('../controller/billController.js');

// Define routes for bills resource
billsRouter.post('/', billController.create);
billsRouter.get('/', billController.findAll);
billsRouter.get('/findOne', billController.findOne);
billsRouter.put('/:id', billController.update);
billsRouter.delete('/:id', billController.delete);

module.exports = billsRouter;

