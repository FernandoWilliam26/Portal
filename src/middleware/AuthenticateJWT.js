import jwt from 'jsonwebtoken';
import { config } from '../config.js';


export function authenticateJWT(req, res, next) {
const authHeader = req.headers['authorization'];
const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;


if (!token) return res.status(401).json({ message: 'Token requerido' });


try {
const payload = jwt.verify(token, config.jwtSecret);
req.user = payload; // { id, username, role }
next();
} catch (err) {
return res.status(401).json({ message: 'Token inválido o expirado' });
}
}