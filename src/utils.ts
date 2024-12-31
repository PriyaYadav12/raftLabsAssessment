import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

export const generateToken = (userId: string): string => {
    const token =  jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
    return token;
};

export const verifyToken = (token: string): any => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        return decoded;
      } catch (err: any) {
        throw new Error('Invalid token/Expired token'); // "jwt expired" expected after expiration
      }
};
