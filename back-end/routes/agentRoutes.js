const express = require('express');
const agentRouter = express.Router();
const AgentController = require('../controller/agentController.js');

// Define routes for Agents resource
agentRouter.post('/',AgentController.upload,AgentController.create)
agentRouter.get('/', AgentController.findAll)
agentRouter.get('/:id', AgentController.findOne)
agentRouter.put('/:id', AgentController.upload, AgentController.update)
agentRouter.delete('/:id', AgentController.delete)

module.exports= agentRouter;