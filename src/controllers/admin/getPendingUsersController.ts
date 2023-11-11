import AppError from '@/common/AppError';
import { IUserDAO, IUserRespDTO } from '@/common/interfaces/IUser';
import { pendingUsers } from '@/services/userService';
import httpResponse from '@/utils/httpResponse';
import { logger } from '@/utils/logger';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export default async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const users: IUserDAO[] = await pendingUsers();
        return new httpResponse(res, {
            users: users.map((user) => {
                const userRespDTO: IUserRespDTO = {
                    user_id: user.user_id,
                    user_name: user.user_name,
                    role: user.role,
                    is_premium: user.user_premium,
                };
                return userRespDTO;
            }),
        }).json();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError(500));
        }
    }
}
