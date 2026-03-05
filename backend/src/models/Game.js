const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Game = sequelize.define('Game', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    gameId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            is: /^[a-z0-9-]+$/ // lowercase, numbers, hyphens only
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.ENUM('adventure', 'puzzle', 'action', 'racing'),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    gamePath: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '' // Will store the relative path to the game folder
    },
    // Store images as BLOB (Binary Large Object)
    bannerImage: {
        type: DataTypes.BLOB('long'), // 'long' for larger files (up to 4GB)
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('bannerImage');
            return rawValue ? rawValue.toString('base64') : null;
        }
    },
    logoImage: {
        type: DataTypes.BLOB('long'),
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('logoImage');
            return rawValue ? rawValue.toString('base64') : null;
        }
    },
    screenshot1: {
        type: DataTypes.BLOB('long'),
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('screenshot1');
            return rawValue ? rawValue.toString('base64') : null;
        }
    },
    screenshot2: {
        type: DataTypes.BLOB('long'),
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('screenshot2');
            return rawValue ? rawValue.toString('base64') : null;
        }
    },
    screenshot3: {
        type: DataTypes.BLOB('long'),
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('screenshot3');
            return rawValue ? rawValue.toString('base64') : null;
        }
    },
    // MIME type to know how to display the image
    bannerMimeType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    logoMimeType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    screenshotMimeType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    instructions: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    difficulty: {
        type: DataTypes.ENUM('easy', 'medium', 'hard'),
        defaultValue: 'medium'
    },
    playCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['gameId']
        },
        {
            fields: ['category']
        },
        {
            fields: ['isActive']
        }
    ]
});

// Update the association with CASCADE delete
Game.associate = (models) => {
    Game.hasMany(models.AdminLog, { 
        as: 'adminLogs', 
        foreignKey: 'gameId',
        onDelete: 'CASCADE',  // This ensures when a Game is deleted, all related AdminLogs are also deleted
        hooks: true // This ensures hooks run on cascade
    });
};

module.exports = Game;