import AppError from '@/common/AppError';
import { allMusic, musicById } from '@/services/musicService';
import httpResponse from '@/utils/httpResponse';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default async function (
    req: Request<{music_id: string}, {}, {}, { premium: 'true' | 'false' }>,
    res: Response,
    next: NextFunction
) {
    if (!req.user) throw new AppError(StatusCodes.UNAUTHORIZED);

    try {
        const music = await musicById(
            req.user?.phpSessId,
            req.user?.id,
            parseInt(req.params.music_id),
            req.query.premium == 'true'
        );

        const musicDTO: IMusicResponseDTO = {
            id: music.id,
            title: music.name,
            genre: music.genre,
            owner_id: music.ownerId,
            upload_date: music.uploadDate,
            is_premium: music.isPremium,
        };

        return new httpResponse(res, { music: musicDTO }).json();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError(500));
        }
    }
}
