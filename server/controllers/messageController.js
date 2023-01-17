const ApiError = require("../error/apiError");
const Message = require('../models/messageModel');
const {Chat} = require("../models/chatModel");
const User = require("../models/userModel");
const {Op} = require("sequelize");

class messageController {
    async showChatMessages(req, res, next) {
        try {
            /*console.log(req.url);*/
            return res.render('messages');
        } catch(e) {
            console.log(e);
            return next(ApiError.internal("Неизвестнаяя ошибка"));
        }
    }
    async addMessage(req, res, next) {
        try {
            const {text, chatId} = req.body;
            /*console.log('-----Adding Message Begin-----');
            console.log(req.body);*/
            const userData = req.user;
            if(!text || !chatId) return next(ApiError.internal("Неизвестная ошибка"));
            if(!userData) return next(ApiError.internal("Неизвестная ошибка"));
            let message = await Message.create({author: userData.nickname, text:text, chatId: chatId, userId: userData.id})
            /*console.log(message);
            console.log('-----Adding Message End-----');*/
            return res.json(message);
        } catch(e) {
            console.log(e);
            return next(ApiError.internal("Неизвестнаяя ошибка"));
        }
    }
    async messageListUpdate(req, res, next) {
        try {
            const userData = req.user;
            let {lastId, chatId} = req.body;

            lastId = lastId ?? 0;


            if(!userData) return next(ApiError.internal("Неизвестная ошибка"));
            let messages = await Message.findAll({
                where: {id: {[Op.gte]: lastId}, chatId: chatId},
                order: [['createdAt', 'ASC']]});


            return res.json(messages);
        } catch(e) {
            console.log(e);
            return next(ApiError.internal("Неизвестнаяя ошибка"));
        }
    }
}

module.exports = new messageController();