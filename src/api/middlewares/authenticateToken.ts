import config from '@/config';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import AppError from '@/common/AppError';
import { StatusCodes } from 'http-status-codes';
import { IUserJWT } from '@/common/interfaces/IUser';

export default function authenticateToken(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers['authorization'];
    const token = authHeader;

    if (token == null) {
        const err = new AppError(StatusCodes.UNAUTHORIZED);
        return next(err);
    }

    try {
        req.user = jwt.verify(token, config.jwtSecret) as IUserJWT;
        return next();
    } catch (error) {
        const appErr = new AppError(StatusCodes.FORBIDDEN);
        return next(appErr);
    }
}
