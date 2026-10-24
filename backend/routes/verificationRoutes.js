const express = require('express');
const router = express.Router();
const { getMyVerification, uploadDocument, deleteDocument, submitVerification } = require('../controllers/verificationController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/me', protect, authorizeRoles('startup'), getMyVerification);
router.post('/documents', protect, authorizeRoles('startup'), uploadDocument);
router.delete('/documents/:docType', protect, authorizeRoles('startup'), deleteDocument);
router.post('/submit', protect, authorizeRoles('startup'), submitVerification);

module.exports = router;
