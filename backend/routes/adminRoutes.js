const express = require('express');
const router = express.Router();
const { getStats, getAllUsers, toggleUserStatus, getAllChallenges, deleteChallenge } = require('../controllers/adminController');
const { listVerifications, getDocumentLink, approveStartup, rejectStartup } = require('../controllers/verificationController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorizeRoles('admin'), getStats);
router.get('/users', protect, authorizeRoles('admin'), getAllUsers);
router.put('/users/:id/toggle-status', protect, authorizeRoles('admin'), toggleUserStatus);
router.put('/startups/:id/verify', protect, authorizeRoles('admin'), approveStartup);
router.put('/startups/:id/reject', protect, authorizeRoles('admin'), rejectStartup);
router.get('/verifications', protect, authorizeRoles('admin'), listVerifications);
router.get('/verifications/documents/:docId/link', protect, authorizeRoles('admin'), getDocumentLink);
router.get('/challenges', protect, authorizeRoles('admin'), getAllChallenges);
router.delete('/challenges/:id', protect, authorizeRoles('admin'), deleteChallenge);

module.exports = router;
