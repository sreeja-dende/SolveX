const express = require('express');
const router = express.Router();
const { getChallenges, getChallengeById, createChallenge, getMyChallenges, closeChallenge, selectWinner } = require('../controllers/challengeController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', protect, getChallenges);
router.get('/my-challenges', protect, authorizeRoles('startup'), getMyChallenges);
router.get('/:id', protect, getChallengeById);
router.post('/', protect, authorizeRoles('startup'), createChallenge);
router.put('/:id/close', protect, authorizeRoles('startup'), closeChallenge);
router.put('/:id/select-winner', protect, authorizeRoles('startup'), selectWinner);

module.exports = router;
