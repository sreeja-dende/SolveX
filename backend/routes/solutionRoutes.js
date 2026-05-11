const express = require('express');
const router = express.Router();
const { submitSolution, getSolutionsForChallenge, getMySolutions, addFeedback } = require('../controllers/solutionController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', protect, authorizeRoles('student'), submitSolution);
router.get('/my-solutions', protect, authorizeRoles('student'), getMySolutions);
router.get('/challenge/:challengeId', protect, authorizeRoles('startup', 'admin'), getSolutionsForChallenge);
router.put('/:id/feedback', protect, authorizeRoles('startup'), addFeedback);

module.exports = router;
