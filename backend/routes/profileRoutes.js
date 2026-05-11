const express = require('express');
const router = express.Router();
const { getMyProfile, updateProfile, getPublicProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, getMyProfile);
router.put('/update', protect, updateProfile);
router.get('/:id', protect, getPublicProfile);

module.exports = router;
