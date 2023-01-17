const sequelize = require('../DB.js');
const {DataTypes} = require('sequelize');
const Chat = require('./chatModel');
const Message = require('./messageModel');

const User = sequelize.define('users', {
    id:{type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    nickname: {type: DataTypes.STRING, unique: true},
    password: {type: DataTypes.STRING, required: true},
    token: {type: DataTypes.STRING}
});

User.hasMany(Message);
Message.belongsTo(User);

module.exports = User;