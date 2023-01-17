const Router = require('express');
const router = Router.Router();
const authMiddleware = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');
const  messageController = require('../controllers/messageController');

router.get('/', authMiddleware, chatController.showAllChats);
router.get('/:id', authMiddleware, messageController.showChatMessages);
router.post('/', authMiddleware, chatController.addChat);
router.put('/', authMiddleware, chatController.chatsListUpdate);

module.exports = router;