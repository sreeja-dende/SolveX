const mongoose = require('mongoose');

// A startup's verification document (GST, incorporation certificate…).
// Stored in MongoDB rather than on disk because Render's free disk is wiped on every deploy.
const verificationDocumentSchema = new mongoose.Schema(
  {
    startup: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    docType: { type: String, enum: ['gst', 'incorporation', 'pan', 'startup_india'], required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, enum: ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'], required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true, select: false },
  },
  { timestamps: true }
);

// One file per document type per startup; uploading again replaces it.
verificationDocumentSchema.index({ startup: 1, docType: 1 }, { unique: true });

module.exports = mongoose.model('VerificationDocument', verificationDocumentSchema);
