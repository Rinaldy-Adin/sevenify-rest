import AppError from '@/common/AppError';
import { IPendingFollowerAction } from '@/common/interfaces/IUser';
import { pendingAction } from '@/services/followerService';
import httpResponse from '@/utils/httpResponse';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default async function (
    req: Request<{ follower_id: string }>,
    res: Response,
    next: NextFunction
) {
    if (!req.user) throw new AppError(StatusCodes.UNAUTHORIZED);

    try {
        const { action }: IPendingFollowerAction = req.body;

        await pendingAction(
            req.user.phpSessId,
            req.user.id,
            parseInt(req.params.follower_id),
            action
        );

        return new httpResponse(res, {
            message:
                action == 'accept'
                    ? 'Successfully accepted follower'
                    : 'Successfully rejected follower',
        }).json();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError(500));
        }
    }
}
