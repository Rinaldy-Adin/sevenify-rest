
import AppError from '@/common/AppError';
import { IUserActionReqDTO, IUserLoginReqDTO } from '@/common/interfaces/IUser';
import { pendingAdminAction, signIn } from '@/services/userService';
import httpResponse from '@/utils/httpResponse';
import { logger } from '@/utils/logger';
import { NextFunction, Request, Response } from 'express';

export default async function (
    req: Request<{ user_id: string }>,
    res: Response,
    next: NextFunction
) {
    try {
        const user_id = parseInt(req.params.user_id);
        const {action}: IUserActionReqDTO = req.body;
        await pendingAdminAction(user_id, action);
        return new httpResponse(res, null, 200, `Successfully ${action}ed user`).json();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError(500));
        }
    }
}
