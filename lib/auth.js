const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_KEY = process.env.JWT_SECRET;

exports.hashPassword = (plain) => bcrypt.hashSync(plain, 10);
exports.comparePassword = (plain, hash) => bcrypt.compareSync(plain, hash);

exports.signToken = (payload) => jwt.sign(payload, JWT_KEY, { expiresIn: '12h' });
exports.verifyToken = (token) => jwt.verify(token, JWT_KEY);
