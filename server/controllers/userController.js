const bcrypt = require('bcrypt');
const {validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const ApiError = require('../error/apiError');
const { Op } = require("sequelize");

const generateJWT = function(id, nickname) {
    return jwt.sign(
        {id: id, nickname: nickname},
        process.env.SECRET_KEY,
        {expiresIn: '12h'},
    );
};

class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()) {
                const fstError = errors.array({ onlyFirstError: true })[0];
                console.log(fstError);
                return next(ApiError.badRequest(fstError.msg));
            }
            console.log(req.body);
            const {nickname, password, rep_password} = req.body;
            if(!nickname || !password || !rep_password) {
                next();
            }
            const candidate = await User.findOne({where: {nickname: nickname}});
            if (candidate) {
                return next(ApiError.badRequest("Пользователь с таким ником уже существует"));
            }
            if (password !== rep_password) {
                return next(ApiError.badRequest("Введённые пароли не совпадают"));
            }
            const hashPassword = await bcrypt.hash(password, 5);
            let user = await User.create({nickname, password: hashPassword});
            const token = generateJWT(user.id, user.nickname);
            await User.update({token: token}, {where: {
                    nickname: user.nickname
                }});
            res.status(303).cookie('token', token, {
                maxAge: 3600*1000*12,
                httpOnly: true
            })
            return res.redirect('http://localhost:5004/chats');
        } catch(e) {
            console.log(e);
            return next(ApiError.internal("Неизвестнаяя ошибка"));
        }
    }
    async login(req, res, next) {
        try {
            const errors = validationResult(req.body);
            if(!errors.isEmpty()) {
                const fstError = errors.array({ onlyFirstError: true })[0];
                console.log(fstError);
                return res.json({
                    msg: fstError.msg
                });
            }
            console.log(req.body);
            const {nickname, password} = req.body;
            if(!nickname || !password) {
                return next(ApiError.badRequest("Некорректный login или password!"));
            }
            const user = await User.findOne({where: {nickname: nickname}});
            let comparePassword;
            if(user) comparePassword = await bcrypt.compare(password, user.password);
            if (!user || !comparePassword) {
                return next(ApiError.badRequest("Неверный login или password!"));
            }
            const token = generateJWT(user.id, user.nickname);
            await User.update({token: token}, {where: {
                    nickname: user.nickname
                }});
            res.status(303).cookie('token', token, {
                maxAge: 3600*1000*12,
                httpOnly: true
            });
            return res.redirect('http://localhost:5004/chats');
        } catch(e) {
            console.log(e);
            return next(ApiError.internal("Неизвестнаяя ошибка"));
        }
    }
    async logout(req, res, next) {
        try {
            const user = req.user;
            await User.update({token: null}, {where: {
                    nickname: user.nickname
                }});
            res.clearCookie('token');
            return res.redirect('registration');
        } catch(e) {
            console.log(e);
            return next(ApiError.internal("Неизвестнаяя ошибка"));
        }
    }
    async getAllUsers(req, res, next) {
        try {
            const userData = req.user;
            const allUsers = await User.findAll({where: {id: {[Op.ne]:userData.id}}});
            let data = {};
            allUsers.map((users) => {
                data[`${users.dataValues.id}`] = users.dataValues.nickname;
                return data;
            });
            console.log(data);
            return res.json(data);
        } catch(e) {
            console.log(e);
            return next(ApiError.internal("Неизвестнаяя ошибка"));
        }
    }
    async sendCandidatesData(req, res) {
        return res.render('registration', {layout: false});
    }
    async sendUserData(req, res) {
        res.render('login', {layout: false});
    }
}

module.exports = new UserController();