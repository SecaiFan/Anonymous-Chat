const sequelize = require('../DB.js');
const {DataTypes} = require('sequelize');
const User = require('./userModel');
const Message = require('./messageModel');

const Chat = sequelize.define('chats', {
    id:{type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING, required: true},
    chat_type: {type: DataTypes.STRING, defaultValue: 'COMMON'},
    participants_amount:{type: DataTypes.INTEGER, required: true}
});

const UserChat = sequelize.define('relations', {
    id:{type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    relation_type: {type: DataTypes.STRING, defaultValue: 'USER'}
});

Chat.belongsToMany(User, {through: UserChat});
User.belongsToMany(Chat, {through: UserChat});

Chat.hasMany(Message)
Message.belongsTo(Chat);

module.exports = {Chat, UserChat};