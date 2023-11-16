import AppError from '@/common/AppError';
import { deleteFollower } from '@/services/followerService';
import httpResponse from '@/utils/httpResponse';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default async function (
    req: Request<{follower_id: string}, {}, {}>,
    res: Response,
    next: NextFunction
) {
    if (!req.user) throw new AppError(StatusCodes.UNAUTHORIZED);

    try {
        await deleteFollower(req.user.phpSessId, req.user.id, parseInt(req.params.follower_id));

        return new httpResponse(res, { message: 'Successfully deleted follower' }).json();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError(500));
        }
    }
}
