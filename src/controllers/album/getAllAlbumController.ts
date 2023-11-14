import AppError from '@/common/AppError';
import { IMusicResponseDTO } from '@/common/interfaces/IMusic';
import { allMusic } from '@/services/musicService';
import httpResponse from '@/utils/httpResponse';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (!req.user) throw new AppError(StatusCodes.UNAUTHORIZED);

    try {

        return new httpResponse(res, null).json();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError(500));
        }
    }
}
