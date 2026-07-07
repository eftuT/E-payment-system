const { ServiceProviders, Payment, User } = require(".");

// billModel.js
module.exports = (sequelize, DataTypes) => {
  const Bill = sequelize.define('Bill', {
    billNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    dateIssued: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    amountDue: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    serviceDescription: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    servicePeriod: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    serviceCharges: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    additionalCharges: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    billStatus: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    TotalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    }
  });

  Bill.associate = (models) => {
    Bill.belongsTo(models.ServiceProviders, {
      foreignKey: 'serviceProviderBIN',
      as: 'ServiceProviders',
    });
    Bill.hasOne(models.Payment, {
      foreignKey: 'paymentId',
      as: 'payments',
    });
    Bill.belongsTo(models.User, {
      foreignKey: 'UserId',
      as: 'Users',
    });
  };

  return Bill;
};

