const sequelize = require('../DB.js');
const {DataTypes} = require('sequelize');

const Message = sequelize.define('messages', {
    id:{type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    author: {type: DataTypes.STRING, required: true},
    text: {type: DataTypes.STRING, required: true}
});

module.exports = Message;