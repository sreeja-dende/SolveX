const User = require('../models/User');

// @desc    Get leaderboard (top students by points/wins)
// @route   GET /api/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const students = await User.find({ role: 'student', isActive: true })
      .select('name college branch profileImage points wins certificates')
      .sort({ points: -1, wins: -1 })
      .limit(50);

    // Assign ranks
    const ranked = students.map((student, index) => ({
      rank: index + 1,
      _id: student._id,
      name: student.name,
      college: student.college,
      branch: student.branch,
      profileImage: student.profileImage,
      points: student.points,
      wins: student.wins,
      certificateCount: student.certificates.length,
    }));

    res.json({ success: true, leaderboard: ranked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getLeaderboard };
