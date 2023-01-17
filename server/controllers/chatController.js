const {Chat, UserChat} = require('../models/chatModel');
const User = require('../models/userModel');
const ApiError = require("../error/apiError");
const { Op } = require("sequelize");

class chatController {
    async showAllChats(req, res, next) {
        return res.render('chats', {layout: false});
    }
    async addChat(req, res, next) {
        try {
            const {title, participants, type} = req.body;
            const userData = req.user;

            if(!title || (type && !participants)) return next(ApiError.internal("Неизвестная ошибка"));
            if(!userData) return next(ApiError.internal("Неизвестная ошибка"));
            let participantsArr = JSON.parse(participants);

            let chat = await Chat.create({
                title: title,
                participants_amount: participantsArr.length + 1,
                chat_type: type
            });

            let user = await User.findOne({where: {id: userData.id}});
            let add = await user.addChat(chat, {through: {relation_type: 'OWNER'}});

            if(type === 'PRIVATE') {
                for (let i = 0; i < participantsArr.length; i += 1) {
                    if (userData.id !== participants[i]) {
                        user = await User.findOne({where: {id: participantsArr[i]}});
                        add = await user.addChat(chat, {through: {relation_type: 'COMMON'}});
                    }
                }
            } else {
                let allUsers = await User.findAll();
                for(let users of Object.values(allUsers)) {
                    console.log(users);
                    user = await User.findOne({where: {id: users.dataValues.id}});
                    add = await user.addChat(chat, {through: {relation_type: 'COMMON'}});
                }

            }

            return res.json(chat);
        } catch(e) {
            console.log(e);
            return next(ApiError.internal("Неизвестнаяя ошибка"));
        }
    }
    async chatsListUpdate(req, res, next) {
        try {
            const userData = req.user;
            let {lastId} = req.body;

            lastId = lastId ?? 0;

            if(!userData) return next(ApiError.internal("Неизвестная ошибка"));
            const user = await User.findOne({where: {id: userData.id}});
            if(!user) return next(ApiError.internal("Пользователь не найден"));

            let chats = await user.getChats({
                where: {[Op.or]: [{id: {[Op.gte]: lastId}}]},
                order: [['createdAt', 'ASC']]});
            let rawData = chats.map((chatSub) => {
                chatSub.dataValues['relation_type'] = chatSub.dataValues.relations.dataValues.relation_type;
                return chatSub.dataValues;
            });

            return res.json(rawData);
        } catch(e) {
            console.log(e);
            return next(ApiError.internal("Неизвестнаяя ошибка"));
        }
    }
}
module.exports = new chatController();