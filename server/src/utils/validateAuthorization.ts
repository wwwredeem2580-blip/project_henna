import CustomError from "./CustomError";
import { verifyToken } from "./auth/token";

export const validateAuthorization = (token: string, secret: string): any => {
    if (!token) {
        throw new CustomError("Unauthorized", 401);
    }
    const decoded = verifyToken(token, secret);
    return decoded;
};