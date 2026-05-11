const mongoose = require('mongoose');

const solutionSchema = new mongoose.Schema(
  {
    challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // The actual solution content
    approach: { type: String, required: true }, // Main solution approach/analysis
    rootCause: { type: String }, // Root cause analysis
    proposedFix: { type: String }, // Proposed fix/strategy
    implementation: { type: String }, // How to implement
    expectedOutcome: { type: String }, // Expected results

    // Startup feedback
    startupFeedback: { type: String, default: '' },
    isWinner: { type: Boolean, default: false },
    startupRating: { type: Number, min: 1, max: 5, default: null },

    status: { type: String, enum: ['submitted', 'reviewed', 'winner'], default: 'submitted' },
  },
  { timestamps: true }
);

// Prevent duplicate submissions by same student
solutionSchema.index({ challenge: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Solution', solutionSchema);
