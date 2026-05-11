const User = require('../models/User');
const Challenge = require('../models/Challenge');
const Solution = require('../models/Solution');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalStartups = await User.countDocuments({ role: 'startup' });
    const totalChallenges = await Challenge.countDocuments();
    const openChallenges = await Challenge.countDocuments({ status: 'open' });
    const totalSolutions = await Solution.countDocuments();
    const winnersSelected = await Challenge.countDocuments({ status: 'winner_selected' });

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalStartups,
        totalChallenges,
        openChallenges,
        totalSolutions,
        winnersSelected,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let filter = {};
    if (role) filter.role = role;
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-status
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'suspended'}`, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify a startup
// @route   PUT /api/admin/startups/:id/verify
const verifyStartup = async (req, res) => {
  try {
    const startup = await User.findById(req.params.id);
    if (!startup || startup.role !== 'startup') {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }
    startup.isVerified = true;
    await startup.save();
    res.json({ success: true, message: 'Startup verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all challenges (admin view)
// @route   GET /api/admin/challenges
const getAllChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find()
      .populate('startup', 'name companyName')
      .populate('winner', 'name college')
      .sort({ createdAt: -1 });
    res.json({ success: true, challenges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a challenge
// @route   DELETE /api/admin/challenges/:id
const deleteChallenge = async (req, res) => {
  try {
    await Challenge.findByIdAndDelete(req.params.id);
    await Solution.deleteMany({ challenge: req.params.id });
    res.json({ success: true, message: 'Challenge deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStats, getAllUsers, toggleUserStatus, verifyStartup, getAllChallenges, deleteChallenge };
