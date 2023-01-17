const Router = require('express');
const authMiddleware = require("../middleware/authMiddleware");
const messageController = require('../controllers/messageController');
const router = Router.Router();

router.get('/',authMiddleware, messageController.showChatMessages);
router.post('/',authMiddleware, messageController.addMessage);
router.put('/',authMiddleware, messageController.messageListUpdate);

module.exports = router;