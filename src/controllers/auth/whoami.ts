import AppError from '@/common/AppError';
import httpResponse from '@/utils/httpResponse';
import { NextFunction, Request, Response } from 'express';

export default async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        return new httpResponse(res, {
            username: req.user?.username,
            is_premium: req.user?.is_premium,
            role: req.user?.role,
        }).json();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError(500));
        }
    }
}
