const { ServiceProviders, Bill, User, Agents } = require(".");

module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define("Payment", {
    TransactionNo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    paymentDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    payerID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payeeID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paymentDescription: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ReferenceNo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });


  Payment.associate = (models) => {
    Payment.belongsTo(models.Agents, {
      foreignKey: 'agentBIN',
      as: 'Agents',
    });
    Payment.belongsTo(models.User, {
      foreignKey: 'UserId',
      as: 'Payer',
    });
    Payment.belongsTo(models.ServiceProviders, {
      foreignKey: 'serviceProviderBIN',
      as: 'Payee',
    });
    Payment.belongsTo(models.Bill, {
      foreignKey: 'paymentId',
      as: 'Bills',
    });
  };
  return Payment;
};