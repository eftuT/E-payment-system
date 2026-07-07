const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      UserID: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      FirstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      LastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: false,
      },
      UserName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      Password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      PhoneNumber: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      Address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Role: {
        type: DataTypes.ENUM('SuperAdmin', 'Admin', 'User'),
        defaultValue: 'User',
      },
      ProfilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetTokenExpiration: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      tableName: 'Users',
    }
  );

  User.associate = (models) => {
    // Many-to-Many with ServiceProviders
    if (models.ServiceProviders) {
      User.belongsToMany(models.ServiceProviders, {
        through: models.UserServiceProvider,
        foreignKey: 'UserId',
        otherKey: 'serviceProviderBIN',
        as: 'ServiceProviders',
      });
    }

    // Many-to-Many with Agents
    if (models.Agents) {
      User.belongsToMany(models.Agents, {
        through: models.userAgent,
        foreignKey: 'UserId',
        otherKey: 'agentBIN',
        as: 'Agents',
      });
    }

    // One-to-Many with Payment
    if (models.Payment) {
      User.hasMany(models.Payment, {
        foreignKey: 'UserId',
        as: 'Payments',
      });
    }

    // One-to-Many with Bill
    if (models.Bill) {
      User.hasMany(models.Bill, {
        foreignKey: 'UserId',
        as: 'Bills',
      });
    }
  };

  // Create SuperAdmin user after sync
  User.afterSync(async () => {
    try {
      const superAdmin = await User.findOne({ where: { Role: 'SuperAdmin' } });
      if (!superAdmin) {
        const hashedPassword = await bcrypt.hash('Admin@123', 10);
        await User.create({
          UserID: 'SUPERADMIN001',
          FirstName: 'Super',
          LastName: 'Admin',
          Gender: 'male',
          UserName: 'superadmin',
          Password: hashedPassword,
          Email: 'superadmin@example.com',
          PhoneNumber: '1234567890',
          Address: 'Super Admin Address',
          Role: 'SuperAdmin',
        });
        console.log('✅ Super admin user created successfully.');
      }
    } catch (error) {
      console.error('❌ Error creating super admin user:', error);
    }
  });

  return User;
};