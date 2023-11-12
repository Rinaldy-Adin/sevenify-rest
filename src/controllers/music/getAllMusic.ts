import AppError from '@/common/AppError';
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
        const music = await allMusic(req.user?.phpSessId, req.user?.id);

        return new httpResponse(res, music.map((item) => {
            const musicDTO: IMusicResponseDTO = {
                id: item.id,
                title: item.name,
                genre: item.genre,
                owner_id: item.ownerId,
                upload_date: item.uploadDate,
                is_premium: item.isPremium,
            }

            return musicDTO;
        })).json();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError(500));
        }
    }
}
