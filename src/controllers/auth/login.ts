import AppError from '@/common/AppError';
import { IUserLoginReqDTO } from '@/common/interfaces/IUser';
import { signIn } from '@/services/userService';
import httpResponse from '@/utils/httpResponse';
import { logger } from '@/utils/logger';
import { NextFunction, Request, Response } from 'express';

export default async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { username, password }: IUserLoginReqDTO = req.body;
        const { user, token } = await signIn(username, password);
        res.cookie('accessToken', token, { httpOnly: true });
        return new httpResponse(res, {user}).json();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError(500));
        }
    }
}
