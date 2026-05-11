const express = require('express');
const router = express.Router();
const { register, login, getMe, forgotPassword, resetPassword, requestVerification } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/request-verification', protect, requestVerification);

module.exports = router;
