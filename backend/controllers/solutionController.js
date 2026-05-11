const Solution = require('../models/Solution');
const Challenge = require('../models/Challenge');

// @desc    Submit solution (Student only)
// @route   POST /api/solutions
const submitSolution = async (req, res) => {
  try {
    const { challengeId, approach, rootCause, proposedFix, implementation, expectedOutcome } = req.body;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });
    if (challenge.status !== 'open') {
      return res.status(400).json({ success: false, message: 'This challenge is no longer accepting submissions' });
    }

    // Check if already submitted
    const existing = await Solution.findOne({ challenge: challengeId, student: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already submitted a solution for this challenge' });
    }

    const solution = await Solution.create({
      challenge: challengeId,
      student: req.user._id,
      approach,
      rootCause,
      proposedFix,
      implementation,
      expectedOutcome,
    });

    // Increment submission count
    await Challenge.findByIdAndUpdate(challengeId, { $inc: { totalSubmissions: 1 } });

    res.status(201).json({ success: true, message: 'Solution submitted successfully!', solution });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You already submitted a solution for this challenge' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all solutions for a challenge (Startup who owns it)
// @route   GET /api/solutions/challenge/:challengeId
const getSolutionsForChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.challengeId);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });

    if (
      challenge.startup.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these solutions' });
    }

    const solutions = await Solution.find({ challenge: req.params.challengeId })
      .populate('student', 'name college branch year profileImage points wins')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: solutions.length, solutions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my submitted solutions (Student)
// @route   GET /api/solutions/my-solutions
const getMySolutions = async (req, res) => {
  try {
    const solutions = await Solution.find({ student: req.user._id })
      .populate('challenge', 'title startupName status category deadline points')
      .sort({ createdAt: -1 });

    res.json({ success: true, solutions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add startup feedback on a solution
// @route   PUT /api/solutions/:id/feedback
const addFeedback = async (req, res) => {
  try {
    const { feedback, rating } = req.body;
    const solution = await Solution.findById(req.params.id).populate('challenge');

    if (!solution) return res.status(404).json({ success: false, message: 'Solution not found' });
    if (solution.challenge.startup.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    solution.startupFeedback = feedback;
    solution.startupRating = rating;
    solution.status = 'reviewed';
    await solution.save();

    res.json({ success: true, message: 'Feedback added', solution });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { submitSolution, getSolutionsForChallenge, getMySolutions, addFeedback };
