const { AdminActivity } = require('../models');
const { Op } = require('sequelize');

const createAdminActivity = async (req, res) => {
  try {
    const { adminName, action, targetAdminName, timestamp, changedData } = req.body;

    const newAdminActivity = await AdminActivity.create({
      adminName,
      action,
      targetAdminName,
      timestamp,
      changedData,
    });

    res.status(201).json(newAdminActivity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create AdminActivity.',error });
  }
};

const getAllAdminActivities = async (req, res) => {
  try {
    const adminActivities = await AdminActivity.findAll();
    res.status(200).json(adminActivities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin activities.' });
  }
};

module.exports = {
  createAdminActivity,
  getAllAdminActivities,
};