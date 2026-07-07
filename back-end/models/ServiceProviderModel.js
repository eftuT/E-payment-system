const { Agents, Bill, Payment } = require(".");

module.exports = (sequelize, DataTypes) => {
  const ServiceProviders = sequelize.define("ServiceProviders", {
    serviceProviderBIN: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    serviceProviderName: {
      type: DataTypes.STRING,
      allowNUll: false
    },
    servicesOffered: {
      type: DataTypes.STRING,
      allowNUll: false
    },
    BankName: {
      type: DataTypes.STRING,
      allowNUll: false
    },

    BankAccountNumber: {
      type: DataTypes.STRING,
      allowNUll: false
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNUll: false
    },

    serviceProviderAuthorizationLetter: {
      type: DataTypes.STRING,
      allowNull: false
    },

  })
  ServiceProviders.associate = (models) => {
    ServiceProviders.belongsToMany(models.User, {
      through: models.UserServiceProvider,
      foreignKey: 'serviceProviderBIN',
      as: 'Users',
    });
    ServiceProviders.belongsToMany(models.Agents, {
      through: models.AgentServiceProvider,
      foreignKey: 'serviceProviderBIN',
      as: 'Agents',
    });
    ServiceProviders.hasMany(models.Bill, {
      foreignKey: 'serviceProviderBIN',
      as: 'Bills',
    });
    ServiceProviders.hasMany(models.Payment, {
      foreignKey: 'serviceProviderBIN',
      as: 'payments',
    });
  };

  return ServiceProviders;
};

