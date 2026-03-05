const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AdminLog = sequelize.define('AdminLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    adminId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    action: {
        type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE_SOFT', 'DELETE_PERMANENT', 'UPLOAD', 'UPLOAD_IMAGES', 'DELETE_IMAGE'),
        allowNull: false
    },
    gameId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Games',
            key: 'id'
        },
        onDelete: 'CASCADE' // This ensures when a Game is deleted, the reference is handled
    },
    gameFolder: {
        type: DataTypes.STRING,
        allowNull: true
    },
    details: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true
});

AdminLog.associate = (models) => {
    AdminLog.belongsTo(models.User, { as: 'admin', foreignKey: 'adminId' });
    AdminLog.belongsTo(models.Game, { as: 'game', foreignKey: 'gameId' });
};

module.exports = AdminLog;