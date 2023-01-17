const jwt = require('jsonwebtoken');
const User = require("../models/userModel");
const {Chat} = require("../models/chatModel");
const ApiError = require("../error/apiError");

module.exports = async function (req, res, next) {
    if(req.method === 'OPTIONS') {
        next();
    }
    try {
        const token = req.cookies.token;
        const id = +req.url.slice(1);
        if(!token) {
            return res.redirect('user/registration');
        } else {
            const userData = jwt.verify(token, process.env.SECRET_KEY);
            if (!userData) {
                return next(ApiError.unauthorizedError('Требуется подтверждение аккаунта'));
            }
            console.log(userData);
            if(req.params.id) {
                let arr = [];
                let user = await User.findOne({where: {id: userData.id}});
                let chat = await Chat.findOne({where: {id: req.params.id}});
                if(chat.dataValues.chat_type !== 'PRIVATE') next();
                await user.getChats().then(res => {
                    console.log(res);
                    for(let i in res) {
                        arr.push(res[i].dataValues.id);
                    }
                });
                if(arr.indexOf(id) === -1) return res.redirect('/user/login');
            }
            req.user = userData;
            next();
        }
    } catch(e) {
        return next(ApiError.forbidden("Пользователь не авторизован"));
    }
};