require('dotenv').config();
const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const basicAuth = require('express-basic-auth');
const { convertPPTXToHTML } = require('./lib/convert');
const { generateToken, requireAuth } = require('./lib/auth');

const app = express();
const PORT = process.env.PORT || 4000;

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// --- Admin Basic Auth ---
const adminUser = process.env.ADMIN_USER || 'admin';
const adminPass = process.env.ADMIN_PASS || 'password';
app.use('/admin', basicAuth({
  users: { [adminUser]: adminPass },
  challenge: true,
}));

// --- Multer Setup for PPTX Uploads ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_DIR || '/mnt/efs/uploads';
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// --- Routes ---

// Admin upload route
app.post('/admin/upload', upload.single('pptx'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    // Convert PPTX to HTML in a separate folder
    const convertedDir = path.join(process.env.CONVERTED_DIR || '/mnt/efs/converted', path.parse(file.filename).name);
    await convertPPTXToHTML(file.path, convertedDir);

    res.json({ message: 'File uploaded and converted', convertedPath: convertedDir });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload or conversion failed' });
  }
});

// Member login simulation (replace with real DB logic)
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  // Normally verify email/password from DB here
  const dummyUser = { id: 1, email, is_subscribed: true };
  const token = generateToken(dummyUser);
  res.json({ token });
});

// Protected route: slide viewer
app.get('/viewer/:slideId', requireAuth, (req, res) => {
  const slideId = req.params.slideId;
  const convertedDir = path.join(process.env.CONVERTED_DIR || '/mnt/efs/converted', slideId, 'index.html');
  if (!fs.existsSync(convertedDir)) return res.status(404).send('Slide not found');
  res.sendFile(convertedDir);
});

// Dashboard
app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Private site running on port ${PORT}`);
});

// Usage
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const viewerRoutes = require('./routes/viewer');

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);       // Protected with basic auth middleware
app.use('/viewer', viewerRoutes);     // Protected with JWT middleware inside viewer.js
})