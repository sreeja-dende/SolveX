const jwt = require('jsonwebtoken');
const User = require('../models/User');
const VerificationDocument = require('../models/VerificationDocument');

const DOC_TYPES = {
  gst: { label: 'GST Registration Certificate', required: true },
  incorporation: { label: 'Company Incorporation Certificate', required: true },
  pan: { label: 'Company PAN Card', required: false },
  startup_india: { label: 'Startup India Recognition', required: false },
};
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB per file

// Identify the file from its first bytes so a renamed file can't pass as a PDF/image.
const sniffMime = (buf) => {
  if (buf.length < 12) return null;
  if (buf.slice(0, 4).toString('latin1') === '%PDF') return 'application/pdf';
  if (buf[0] === 0x89 && buf.slice(1, 4).toString('latin1') === 'PNG') return 'image/png';
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.slice(0, 4).toString('latin1') === 'RIFF' && buf.slice(8, 12).toString('latin1') === 'WEBP') return 'image/webp';
  return null;
};

const safeName = (name) => String(name || 'document').replace(/[^\w.\- ]+/g, '_').slice(0, 100);

const docMeta = (d) => ({
  _id: d._id,
  docType: d.docType,
  label: DOC_TYPES[d.docType]?.label || d.docType,
  fileName: d.fileName,
  mimeType: d.mimeType,
  size: d.size,
  uploadedAt: d.updatedAt,
});

const statusPayload = (user, docs) => ({
  status: user.isVerified ? 'verified' : (user.verificationStatus || 'none'),
  isVerified: !!user.isVerified,
  rejectionReason: user.verificationData?.rejectionReason || '',
  data: user.verificationData || null,
  documents: docs.map(docMeta),
});

// ── Startup ──────────────────────────────────────────────────────────

// GET /api/verification/me
const getMyVerification = async (req, res) => {
  try {
    const docs = await VerificationDocument.find({ startup: req.user._id }).sort({ docType: 1 });
    res.json({ success: true, ...statusPayload(req.user, docs) });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// POST /api/verification/documents  { docType, fileName, data: base64 }
const uploadDocument = async (req, res) => {
  try {
    const { docType, fileName, data } = req.body;
    if (!DOC_TYPES[docType]) return res.status(400).json({ success: false, message: 'Unknown document type' });
    if (req.user.isVerified) return res.status(400).json({ success: false, message: 'Your startup is already verified' });
    if (req.user.verificationStatus === 'pending') return res.status(400).json({ success: false, message: 'Your documents are under review. Please wait for the admin decision.' });
    if (!data || typeof data !== 'string') return res.status(400).json({ success: false, message: 'No file received' });

    const buf = Buffer.from(data.replace(/^data:[^,]*,/, ''), 'base64');
    if (buf.length === 0) return res.status(400).json({ success: false, message: 'The file is empty' });
    if (buf.length > MAX_BYTES) return res.status(400).json({ success: false, message: 'File is too large (max 2 MB)' });
    const mimeType = sniffMime(buf);
    if (!mimeType) return res.status(400).json({ success: false, message: 'Only PDF, PNG, JPG or WEBP files are allowed' });

    const doc = await VerificationDocument.findOneAndUpdate(
      { startup: req.user._id, docType },
      { fileName: safeName(fileName), mimeType, size: buf.length, data: buf },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );
    res.status(201).json({ success: true, document: docMeta(doc) });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// DELETE /api/verification/documents/:docType
const deleteDocument = async (req, res) => {
  try {
    if (req.user.verificationStatus === 'pending') {
      return res.status(400).json({ success: false, message: 'Documents are under review and can\'t be removed now' });
    }
    await VerificationDocument.deleteOne({ startup: req.user._id, docType: req.params.docType });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// POST /api/verification/submit  { companyName, registrationNumber, ... }
const submitVerification = async (req, res) => {
  try {
    if (req.user.isVerified) return res.status(400).json({ success: false, message: 'Your startup is already verified' });
    const { companyName, registrationNumber, yearFounded, teamSize, description, linkedinUrl, websiteUrl } = req.body;
    if (!companyName?.trim() || !registrationNumber?.trim()) {
      return res.status(400).json({ success: false, message: 'Company name and registration number are required' });
    }
    const uploaded = (await VerificationDocument.find({ startup: req.user._id }).select('docType')).map(d => d.docType);
    const missing = Object.entries(DOC_TYPES).filter(([k, v]) => v.required && !uploaded.includes(k)).map(([, v]) => v.label);
    if (missing.length) return res.status(400).json({ success: false, message: `Please upload: ${missing.join(', ')}` });

    const update = {
      companyName: companyName.trim(),
      verificationStatus: 'pending',
      verificationData: {
        registrationNumber: registrationNumber.trim(),
        yearFounded, teamSize, linkedinUrl, websiteUrl, description,
        submittedAt: new Date(),
      },
    };
    if (description?.trim()) update.companyDescription = description.trim();
    if (websiteUrl?.trim()) update.website = websiteUrl.trim();
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });
    const docs = await VerificationDocument.find({ startup: user._id });
    res.json({ success: true, message: 'Verification request submitted!', ...statusPayload(user, docs) });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// ── Admin ────────────────────────────────────────────────────────────

// GET /api/admin/verifications?status=pending|verified|rejected
const listVerifications = async (req, res) => {
  try {
    const status = ['pending', 'verified', 'rejected'].includes(req.query.status) ? req.query.status : 'pending';
    const filter = { role: 'startup' };
    if (status === 'verified') filter.isVerified = true;
    else { filter.verificationStatus = status; filter.isVerified = { $ne: true }; }

    const startups = await User.find(filter)
      .select('name email companyName industry website companyDescription isVerified verificationStatus verificationData createdAt')
      .sort({ 'verificationData.submittedAt': -1 })
      .lean();
    const docs = await VerificationDocument.find({ startup: { $in: startups.map(s => s._id) } }).sort({ docType: 1 });
    const byStartup = {};
    docs.forEach(d => { (byStartup[d.startup] = byStartup[d.startup] || []).push(docMeta(d)); });
    res.json({ success: true, startups: startups.map(s => ({ ...s, documents: byStartup[s._id] || [] })) });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// GET /api/admin/verifications/documents/:docId/link → short-lived URL the admin can open in a browser tab
const getDocumentLink = async (req, res) => {
  try {
    const doc = await VerificationDocument.findById(req.params.docId).select('_id');
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    const token = jwt.sign({ doc: String(doc._id), purpose: 'verification-doc' }, process.env.JWT_SECRET, { expiresIn: '5m' });
    const base = `${req.protocol}://${req.get('host')}`;
    res.json({ success: true, url: `${base}/api/files/verification/${doc._id}?token=${token}` });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// GET /api/files/verification/:docId?token=…  (no login header — the signed token is the permission)
const streamDocument = async (req, res) => {
  try {
    let payload;
    try { payload = jwt.verify(String(req.query.token || ''), process.env.JWT_SECRET); }
    catch (e) { return res.status(401).send('This link has expired. Open the document again from the admin panel.'); }
    if (payload.purpose !== 'verification-doc' || payload.doc !== req.params.docId) return res.status(403).send('Invalid link');

    const doc = await VerificationDocument.findById(req.params.docId).select('+data');
    if (!doc) return res.status(404).send('Document not found');
    res.set({
      'Content-Type': doc.mimeType,
      'Content-Length': doc.data.length,
      'Content-Disposition': `inline; filename="${doc.fileName.replace(/"/g, '')}"`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-store',
    });
    res.send(doc.data);
  } catch (error) { res.status(500).send('Could not load document'); }
};

// PUT /api/admin/startups/:id/verify
const approveStartup = async (req, res) => {
  try {
    const startup = await User.findById(req.params.id);
    if (!startup || startup.role !== 'startup') return res.status(404).json({ success: false, message: 'Startup not found' });
    startup.isVerified = true;
    startup.verificationStatus = 'verified';
    startup.verificationData = { ...(startup.verificationData || {}), rejectionReason: '', reviewedAt: new Date(), reviewedBy: req.user._id };
    startup.markModified('verificationData');
    await startup.save();
    res.json({ success: true, message: 'Startup verified successfully' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// PUT /api/admin/startups/:id/reject  { reason }
const rejectStartup = async (req, res) => {
  try {
    const reason = String(req.body.reason || '').trim();
    if (reason.length < 5) return res.status(400).json({ success: false, message: 'Please give a reason (at least 5 characters)' });
    const startup = await User.findById(req.params.id);
    if (!startup || startup.role !== 'startup') return res.status(404).json({ success: false, message: 'Startup not found' });
    startup.isVerified = false;
    startup.verificationStatus = 'rejected';
    startup.verificationData = { ...(startup.verificationData || {}), rejectionReason: reason.slice(0, 500), reviewedAt: new Date(), reviewedBy: req.user._id };
    startup.markModified('verificationData');
    await startup.save();
    res.json({ success: true, message: 'Verification rejected' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

module.exports = {
  getMyVerification, uploadDocument, deleteDocument, submitVerification,
  listVerifications, getDocumentLink, streamDocument, approveStartup, rejectStartup,
};
