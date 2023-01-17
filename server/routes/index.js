const Router = require('express');
const router = Router.Router();
const chatsRouter = require('./chatsRouter');
const messagesRouter = require('./messagesRouter');
const userRouter = require('./userRouter');

router.get('/', (req,res) => {
    return res.redirect('/chats');
});

router.use('/chats', chatsRouter);
router.use('/messages', messagesRouter);
router.use('/user', userRouter);

module.exports = router;