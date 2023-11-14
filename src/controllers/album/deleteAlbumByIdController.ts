import AppError from '@/common/AppError';
import httpResponse from '@/utils/httpResponse';
import { NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { deleteMusic } from '@/services/musicService';
import { logger } from '@/utils/logger';
import { IMusicResponseDTO } from '@/common/interfaces/IMusic';

export default async function (
    req: Request<{ music_id: string }, {}, {}, { premium: 'true' | 'false' }>,
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
