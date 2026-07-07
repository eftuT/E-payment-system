const express = require('express');
const serviceProvidersRouter = express.Router();
const serviceProviderController = require('../controller/serviceProviderController');

// Define routes for service provider resource
serviceProvidersRouter.post('/', serviceProviderController.upload, serviceProviderController.create);
serviceProvidersRouter.get('/', serviceProviderController.findAll);
serviceProvidersRouter.get('/:id', serviceProviderController.findOne);
serviceProvidersRouter.put('/:id', serviceProviderController.upload, serviceProviderController.update);
serviceProvidersRouter.delete('/:id', serviceProviderController.delete);

module.exports = serviceProvidersRouter;