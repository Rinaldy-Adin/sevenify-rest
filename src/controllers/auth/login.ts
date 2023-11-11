import AppError from '@/common/AppError';
import { IUserDTO } from '@/common/interfaces/IUser';
import { signIn } from '@/services/authService';
import httpResponse from '@/utils/httpResponse';
import { logger } from '@/utils/logger';
import { NextFunction, Request, Response } from 'express';

export default async function (req: Request, res: Response, next: NextFunction) {
    try {
        const { username, password }: IUserDTO = req.body;
        const {user, token} = await signIn(username, password);
        return new httpResponse(res, {user, token}).json();
    } catch (error) {
        logger.info(error);
        if (error instanceof Error) {
            next(new AppError(500, error.message));
        } else {
            next(new AppError(500));
        }
    }
}
