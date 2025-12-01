const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { requireAuth } = require('../lib/auth');

// GET /viewer/:slideId
router.get('/:slideId', requireAuth, (req, res) => {
    const slideId = req.params.slideId;
    const slidePath = path.join(process.env.CONVERTED_DIR || '/mnt/efs/converted', slideId, 'index.html');

    if (!fs.existsSync(slidePath)) return res.status(404).send('Slide not found');
    res.sendFile(slidePath);
});

module.exports = router;
