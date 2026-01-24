import jwt from "jsonwebtoken";
import { JwtTokenPayload } from "../../types/auth.type";
import CustomError from "../CustomError";

export const generateAccessToken = (payload: JwtTokenPayload): string => {
    return jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET! || 'secret', { expiresIn: '15m' });
}

export const generateRefreshToken = (payload: JwtTokenPayload): string => {
    return jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET! || 'secret', { expiresIn: '7d' });
}

export const verifyToken = (token: string, secret: string): any => {
    return jwt.verify(token, secret, (error, decoded)=> {
        if(error){
            throw new CustomError("Unauthorized", 401);
        }
        return decoded;
    })
};