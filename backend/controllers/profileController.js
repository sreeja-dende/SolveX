const User = require('../models/User');

// @desc    Get own profile
// @route   GET /api/profile/me
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update profile
// @route   PUT /api/profile/update
const updateProfile = async (req, res) => {
  try {
    const { name, bio, skills, college, branch, year, companyDescription, website, industry } = req.body;
    const updateData = { name, bio };

    if (req.user.role === 'student') {
      Object.assign(updateData, { skills, college, branch, year });
    } else if (req.user.role === 'startup') {
      Object.assign(updateData, { companyDescription, website, industry });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get public profile of any student
// @route   GET /api/profile/:id
const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name college branch profileImage points wins certificates role companyName industry'
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMyProfile, updateProfile, getPublicProfile };
