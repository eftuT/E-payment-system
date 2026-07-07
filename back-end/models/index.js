"use strict";
const { Model, Sequelize } = require('sequelize');
const dbConfig = require('../config/dbConfig.js');

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
}
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Bill = require('./billModel.js')(sequelize, Sequelize);
db.Agents = require('./agentModel.js')(sequelize, Sequelize);
db.User = require('./UserModel.js')(sequelize, Sequelize);
db.ServiceProviders = require('./ServiceProviderModel.js')(sequelize, Sequelize);
db.Payment = require('./PaymentModel.js')(sequelize, Sequelize);
db.AdminActivity = require('./adminActivityModel.js')(sequelize, Sequelize);

// Define User-Agents junction table
const UserAgent = sequelize.define('userAgent', {});

// Define Agents-ServiceProvider junction table
const AgentServiceProvider = sequelize.define('agentServiceProvider', {});

// Define User-Agents junction table
const AdminActivity = sequelize.define('adminActivity', {});

// Define User-ServiceProvider junction table
const UserServiceProvider = sequelize.define('userServiceProvider', {
  serviceNo: {
    type: Sequelize.INTEGER
  }
});

// Define associations
db.User.belongsToMany(db.Agents, {
  through: UserAgent,
  as: 'Agents',
  foreignKey: 'UserId'
});
db.Agents.belongsToMany(db.User, {
  through: UserAgent,
  as: 'User',
  foreignKey: 'AgentBIN'
});

db.Agents.belongsToMany(db.ServiceProviders, {
  through: AgentServiceProvider,
  as: 'ServiceProviders',
  foreignKey: 'AgentBIN'
});
db.ServiceProviders.belongsToMany(db.Agents, {
  through: AgentServiceProvider,
  as: 'Agents',
  foreignKey: 'serviceProviderBIN'
});

db.User.belongsToMany(db.ServiceProviders, {
  through: UserServiceProvider,
  as: 'ServiceProviders',
  foreignKey: 'UserId'
});
db.ServiceProviders.belongsToMany(db.User, {
  through: UserServiceProvider,
  as: 'User',
  foreignKey: 'serviceProviderBIN'
});

db.Agents.hasMany(db.Payment);
db.Payment.belongsTo(db.Agents);

db.User.hasMany(db.Payment);
db.Payment.belongsTo(db.User);

db.ServiceProviders.hasMany(db.Payment);
db.Payment.belongsTo(db.ServiceProviders);

db.ServiceProviders.hasMany(db.Bill);
db.Bill.belongsTo(db.ServiceProviders);

db.Payment.hasOne(db.Bill);
db.Bill.belongsTo(db.Payment);

db.User.hasMany(db.Bill);
db.Bill.belongsTo(db.User);

db.UserAgent = UserAgent;
db.AgentServiceProvider = AgentServiceProvider;
db.UserServiceProvider = UserServiceProvider;

module.exports = db;