const express = require('express');
const router = express.Router();
const { getStats, getAllUsers, toggleUserStatus, verifyStartup, getAllChallenges, deleteChallenge } = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorizeRoles('admin'), getStats);
router.get('/users', protect, authorizeRoles('admin'), getAllUsers);
router.put('/users/:id/toggle-status', protect, authorizeRoles('admin'), toggleUserStatus);
router.put('/startups/:id/verify', protect, authorizeRoles('admin'), verifyStartup);
router.get('/challenges', protect, authorizeRoles('admin'), getAllChallenges);
router.delete('/challenges/:id', protect, authorizeRoles('admin'), deleteChallenge);

module.exports = router;
