const authModel = require('../models/authModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { username, password, region } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await authModel.createUser(username, hashedPassword, region);
    res.status(201).json({ message: 'User registered', user });
};

const login = async (req, res) => {
    const { username, password } = req.body;
    const user = await authModel.findUserByUsername(username);
    if (!user) return res.status(400).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Incorrect password' });

    const token = jwt.sign({ id: user.id }, 'SECRET_KEY', { expiresIn: '1h' });
    res.json({ token });
};

module.exports = { register, login };
