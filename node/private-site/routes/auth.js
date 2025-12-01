const express = require('express');
const router = express.Router();
const { generateToken } = require('../lib/auth');

// Simulated login (replace with DB logic)
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // TODO: Validate email/password from your database
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    const dummyUser = { id: 1, email, is_subscribed: true }; // Replace with real DB user
    const token = generateToken(dummyUser);
    res.json({ token });
});

module.exports = router;
