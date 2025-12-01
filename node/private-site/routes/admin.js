const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { convertPPTXToHTML } = require('../lib/convert');

// Multer setup for uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = process.env.UPLOAD_DIR || '/mnt/efs/uploads';
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// POST /admin/upload
router.post('/upload', upload.single('pptx'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'No file uploaded' });

        const convertedDir = path.join(process.env.CONVERTED_DIR || '/mnt/efs/converted', path.parse(file.filename).name);
        await convertPPTXToHTML(file.path, convertedDir);

        res.json({ message: 'File uploaded and converted', convertedPath: convertedDir });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Upload or conversion failed' });
    }
});

module.exports = router;
