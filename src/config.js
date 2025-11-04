import dotenv from 'dotenv';
dotenv.config();


export const config = {
port: process.env.PORT || 3000,
mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/pw1_practica',
jwtSecret: process.env.JWT_SECRET || 'af31b72e2d948b9a7f10a52c87de14c2bb9c75d6d4873ef1c6a5b98e1430f9a0c42178fb',
clientUrl: process.env.CLIENT_URL || 'http://localhost:3000'
};