import config from '@/config';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import AppError from '@/common/AppError';
import { StatusCodes } from 'http-status-codes';
import { IUserJWT } from '@/common/interfaces/IUser';
import { logger } from '@/utils/logger';

export default function authenticateToken(
    isPremium: boolean | null,
    ...roles: ('admin' | 'user')[]
) {
    return (req: Request, res: Response, next: NextFunction) => {
        {
            const token = req.cookies['accessToken'] ?? null;

            if (token == null) {
                const err = new AppError(StatusCodes.UNAUTHORIZED);
                return next(err);
            }

            try {
                req.user = jwt.verify(token, config.jwtSecret) as IUserJWT;
                if (
                    (isPremium == null ||
                        (isPremium != null &&
                            req.user.is_premium == isPremium)) &&
                    roles.includes(req.user.role)
                ) {
                    return next();
                } else {
                    throw new AppError();
                }
            } catch (error) {
                const appErr = new AppError(StatusCodes.FORBIDDEN);
                return next(appErr);
            }
        }
    };
}
