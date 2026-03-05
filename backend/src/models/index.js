const Game = require('./Game');
const User = require('./User');
const AdminLog = require('./AdminLog');

// Define associations
Game.associate = (models) => {
    Game.hasMany(AdminLog, { as: 'adminLogs', foreignKey: 'gameId' });
};

User.associate = (models) => {
    User.hasMany(AdminLog, { as: 'adminLogs', foreignKey: 'adminId' });
};

AdminLog.associate = (models) => {
    AdminLog.belongsTo(User, { as: 'admin', foreignKey: 'adminId' });
    AdminLog.belongsTo(Game, { as: 'game', foreignKey: 'gameId' });
};

module.exports = {
    Game,
    User,
    AdminLog
};