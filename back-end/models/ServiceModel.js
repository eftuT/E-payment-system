module.exports = (sequelize, DataTypes) => {
    const Services = sequelize.define("Services", {
        Services_id:
        {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Services_name:
        {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Services_description:
        {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Services_contact:
        {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

    });
    return Services;
};