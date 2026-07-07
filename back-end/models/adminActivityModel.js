module.exports = (sequelize, DataTypes) => {
    const AdminActivity = sequelize.define("AdminActivity", {
    adminName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    targetAdminName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    timestamp: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    changedData: {
        type: DataTypes.JSON,
        allowNull: true,
    },
});
return AdminActivity;
};