const Router = require('express');
const router = Router.Router();
const {body} = require('express-validator');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/registration', userController.sendCandidatesData);
router.post('/registration',
    body('nickname')
        .escape(),
    body('password')
        .trim()
        .isLength({min: 6})
        .withMessage("Пароль должен содержать не менее 6 символов")
        .escape()
        .matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, "i")
        .withMessage("Пароль должен содержать хотя бы один символ, не являющийся цифрой"),
    userController.registration);
router.get('/login', userController.sendUserData);
router.post('/login',
    body('login')
        .escape(),
    body('password')
        .escape(),
    userController.login);
router.get('/logout',authMiddleware, userController.logout);
router.put('/getAll', authMiddleware, userController.getAllUsers);

module.exports = router;