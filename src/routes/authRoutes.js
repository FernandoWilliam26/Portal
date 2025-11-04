import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { config } from '../config.js';


const router = Router();


// Registro
router.post('/register', async (req, res) => {
try {
const { username, email, password, role } = req.body;
if (!username || !email || !password) {
return res.status(400).json({ message: 'username, email y password son obligatorios' });
}


const exists = await User.findOne({ $or: [{ email }, { username }] });
if (exists) return res.status(409).json({ message: 'Usuario o email ya existe' });


const passwordHash = await bcrypt.hash(password, 10);
const user = await User.create({ username, email, passwordHash, role: role === 'admin' ? 'admin' : 'user' });


const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, config.jwtSecret, { expiresIn: '7d' });
res.status(201).json({ token, user: { id: user._id, username: user.username, role: user.role } });
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Error en registro' });
}
});


// Login
router.post('/login', async (req, res) => {
try {
const { email, password } = req.body;
const user = await User.findOne({ email });
if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });


const ok = await bcrypt.compare(password, user.passwordHash);
if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });


const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, config.jwtSecret, { expiresIn: '7d' });
res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Error en login' });
}
});


export default router;