const Game = require('./Game');
const User = require('./User');
const AdminLog = require('./AdminLog');

const models = {
    Game,
    User,
    AdminLog
};

// Define associations
Game.associate = (models) => {
    Game.hasMany(models.AdminLog, { 
        as: 'adminLogs', 
        foreignKey: 'gameId' 
    });
};

User.associate = (models) => {
    User.hasMany(models.AdminLog, { 
        as: 'adminLogs', 
        foreignKey: 'adminId' 
    });
};

AdminLog.associate = (models) => {
    AdminLog.belongsTo(models.User, { as: 'admin', foreignKey: 'adminId' });
    AdminLog.belongsTo(models.Game, { as: 'game', foreignKey: 'gameId' });
};

// Establish associations
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

module.exports = models;