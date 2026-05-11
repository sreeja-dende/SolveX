const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['process', 'technical', 'data', 'product', 'growth', 'other'],
      required: true,
    },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    tags: [{ type: String }],

    // Posted by startup
    startup: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startupName: { type: String },

    // Status lifecycle: open → closed → winner_selected
    status: { type: String, enum: ['open', 'closed', 'winner_selected'], default: 'open' },

    deadline: { type: Date, required: true },
    reward: { type: String, default: 'Certificate + Leaderboard Points' },
    points: { type: Number, default: 100 },

    // Winner info
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    winnerSolution: { type: mongoose.Schema.Types.ObjectId, ref: 'Solution', default: null },

    totalSubmissions: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Challenge', challengeSchema);
