import AppError from '@/common/AppError';
import { IMusicResponseDTO } from '@/common/interfaces/IMusic';
import { IUserRespDTO } from '@/common/interfaces/IUser';
import { currentFollowers, soaphealth } from '@/services/followerService';
import { musicById } from '@/services/musicService';
import httpResponse from '@/utils/httpResponse';
import { logger } from '@/utils/logger';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (!req.user) throw new AppError(StatusCodes.UNAUTHORIZED);

    try {
        const users: IUserRespDTO[] = (await currentFollowers(req.user.phpSessId, req.user.id)).map((user) => ({
            user_id: user.user_id,
            is_premium: user.user_premium,
            role: user.role,
            user_name: user.user_name
        }));

        return new httpResponse(res, { followers: users }).json();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError(500));
        }
    }
}
