const { ServiceProviders, User, Payment } = require(".");

// agentModel.js
module.exports = (sequelize, DataTypes) => {
  const Agents = sequelize.define("Agents", {
    agentBIN: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    agentName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    agentEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    servicesOffered: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    agentAuthorizationLetter: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  });
  Agents.associate = (models) => {
    Agents.belongsToMany(models.ServiceProviders, {
      through: models.agentServiceProvider,
      foreignKey: 'agentBIN',
      as: 'ServiceProviders',
    });
    Agents.belongsToMany(models.User, {
      through: models.userAgent,
      foreignKey: 'agentBIN',
      as: 'Agents',
    });
    Agents.hasMany(models.Payment, {
      foreignKey: 'agentBIN',
      as: 'Payments',
    });

  };
  return Agents;
};

