const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['student', 'startup', 'admin'], required: true },

    // Student-specific fields
    college: { type: String },
    branch: { type: String },
    year: { type: String },
    bio: { type: String },
    skills: [{ type: String }],
    points: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    certificates: [
      {
        challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
        challengeTitle: String,
        startupName: String,
        awardedAt: { type: Date, default: Date.now },
        certificateCode: String,
      },
    ],

    // Startup-specific fields
    companyName: { type: String },
    industry: { type: String },
    website: { type: String },
    companyDescription: { type: String },
    isVerified: { type: Boolean, default: false },

    // Common
    profileImage: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    verificationStatus: { type: String, enum: ['none', 'pending', 'verified', 'rejected'], default: 'none' },
    verificationData: { type: Object, default: null },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
