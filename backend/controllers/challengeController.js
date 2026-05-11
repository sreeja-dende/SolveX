const Challenge = require('../models/Challenge');
const Solution = require('../models/Solution');
const User = require('../models/User');

// @desc    Get all open challenges
// @route   GET /api/challenges
const getChallenges = async (req, res) => {
  try {
    const { category, difficulty, status, search } = req.query;
    let filter = { isActive: true };

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (status) filter.status = status;
    else filter.status = 'open';
    if (search) filter.title = { $regex: search, $options: 'i' };

    const challenges = await Challenge.find(filter)
      .populate('startup', 'name companyName profileImage')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: challenges.length, challenges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single challenge
// @route   GET /api/challenges/:id
const getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('startup', 'name companyName profileImage industry')
      .populate('winner', 'name college profileImage');

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    // Increment views
    challenge.views += 1;
    await challenge.save();

    res.json({ success: true, challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create challenge (Startup only)
// @route   POST /api/challenges
const createChallenge = async (req, res) => {
  try {
    const { title, description, category, difficulty, tags, deadline, reward, points } = req.body;
    const startup = await User.findById(req.user._id);

    const challenge = await Challenge.create({
      title,
      description,
      category,
      difficulty,
      tags: tags || [],
      deadline,
      reward,
      points: points || 100,
      startup: req.user._id,
      startupName: startup.companyName || startup.name,
    });

    res.status(201).json({ success: true, challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get challenges posted by logged-in startup
// @route   GET /api/challenges/my-challenges
const getMyChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({ startup: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, challenges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Close challenge (stop accepting submissions)
// @route   PUT /api/challenges/:id/close
const closeChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });
    if (challenge.startup.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    challenge.status = 'closed';
    await challenge.save();
    res.json({ success: true, message: 'Challenge closed', challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Select winner
// @route   PUT /api/challenges/:id/select-winner
const selectWinner = async (req, res) => {
  try {
    const { solutionId } = req.body;
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });
    if (challenge.startup.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (challenge.status === 'winner_selected') {
      return res.status(400).json({ success: false, message: 'Winner already selected' });
    }

    const solution = await Solution.findById(solutionId);
    if (!solution) return res.status(404).json({ success: false, message: 'Solution not found' });

    // Mark solution as winner
    solution.isWinner = true;
    solution.status = 'winner';
    await solution.save();

    // Update challenge
    challenge.winner = solution.student;
    challenge.winnerSolution = solution._id;
    challenge.status = 'winner_selected';
    await challenge.save();

    // Award points + certificate to winning student
    const certCode = `SOLVEX-${challenge._id.toString().slice(-6).toUpperCase()}-${Date.now()}`;
    await User.findByIdAndUpdate(solution.student, {
      $inc: { points: challenge.points, wins: 1 },
      $push: {
        certificates: {
          challengeId: challenge._id,
          challengeTitle: challenge.title,
          startupName: challenge.startupName,
          awardedAt: new Date(),
          certificateCode: certCode,
        },
      },
    });

    res.json({ success: true, message: 'Winner selected and certificate awarded!', challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getChallenges, getChallengeById, createChallenge, getMyChallenges, closeChallenge, selectWinner };
