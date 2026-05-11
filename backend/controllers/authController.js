const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const otpStore = {};

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const sendOTPEmail = async (toEmail, otp) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_gmail@gmail.com') return;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  await transporter.sendMail({
    from: `"SolveX" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'SolveX — Password Reset OTP',
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:12px;">
      <h2 style="color:#0A2463;">SolveX Password Reset</h2>
      <p style="color:#5A6A7A;">Use the OTP below to reset your password:</p>
      <div style="background:#EEF4FF;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
        <span style="font-size:36px;font-weight:900;letter-spacing:8px;color:#0A2463;">${otp}</span>
      </div>
      <p style="color:#5A6A7A;font-size:13px;">Valid for <strong>10 minutes</strong>. If you did not request this, ignore this email.</p>
      <p style="color:#9AABB8;font-size:12px;text-align:center;margin-top:20px;">SolveX — Where Real Problems Meet Smart Minds</p>
    </div>`,
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password, role, college, branch, year, rollNumber, skills, companyName, industry, website, companyDescription } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Name is required' });
    if (!email || !isValidEmail(email.trim())) return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    if (!password || password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    if (!['student', 'startup', 'admin'].includes(role)) return res.status(400).json({ success: false, message: 'Invalid role' });

    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

    const userData = { name: name.trim(), email: email.trim().toLowerCase(), password, role };
    if (role === 'student') {
      userData.college = college || '';
      userData.branch = branch || '';
      userData.year = year || '';
      userData.rollNumber = rollNumber || '';
      userData.skills = Array.isArray(skills) ? skills.filter(Boolean) :
        (typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(Boolean) : []);
    } else if (role === 'startup') {
      userData.companyName = companyName || '';
      userData.industry = industry || '';
      userData.website = website || '';
      userData.companyDescription = companyDescription || '';
    }

    const user = await User.create(userData);
    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, companyName: user.companyName, college: user.college, points: user.points, wins: user.wins } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !isValidEmail(email.trim())) return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    if (!password) return res.status(400).json({ success: false, message: 'Password is required' });
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account suspended. Contact admin.' });
    const token = generateToken(user._id);
    res.json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, companyName: user.companyName, college: user.college, points: user.points, wins: user.wins, certificates: user.certificates } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email.trim())) return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    const key = email.trim().toLowerCase();
    const user = await User.findOne({ email: key });
    if (!user) return res.status(404).json({ success: false, message: 'No account found with this email' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[key] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };
    console.log(`\n🔑 OTP for ${key}: ${otp} (10 min)\n`);
    try { await sendOTPEmail(email.trim(), otp); console.log('✅ Email sent'); }
    catch (e) { console.error('Email failed (OTP still works via console):', e.message); }
    res.json({ success: true, message: 'OTP sent to your email address.', devOtp: process.env.NODE_ENV === 'development' ? otp : undefined });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ success: false, message: 'Email, OTP and new password are required' });
    if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    const key = email.trim().toLowerCase();
    const stored = otpStore[key];
    if (!stored) return res.status(400).json({ success: false, message: 'No OTP found. Please request a new one.' });
    if (Date.now() > stored.expiresAt) { delete otpStore[key]; return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' }); }
    if (stored.otp !== otp.trim()) return res.status(400).json({ success: false, message: 'Invalid OTP. Please check and try again.' });
    const user = await User.findOne({ email: key });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.password = newPassword;
    await user.save();
    delete otpStore[key];
    res.json({ success: true, message: 'Password reset successfully! You can now login.' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const requestVerification = async (req, res) => {
  try {
    const { companyName, registrationNumber, yearFounded, teamSize, description, linkedinUrl, websiteUrl, uploadedDocs } = req.body;
    await User.findByIdAndUpdate(req.user._id, { companyName, companyDescription: description, website: websiteUrl, verificationData: { registrationNumber, yearFounded, teamSize, linkedinUrl, uploadedDocs, submittedAt: new Date() }, verificationStatus: 'pending' });
    res.json({ success: true, message: 'Verification request submitted!' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword, requestVerification };
