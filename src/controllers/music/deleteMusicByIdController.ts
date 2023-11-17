import AppError from '@/common/AppError';
import httpResponse from '@/utils/httpResponse';
import { NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { deleteMusic, getAudioExt, getMusicCoverExt } from '@/services/musicService';
import { logger } from '@/utils/logger';
import { IMusicResponseDTO } from '@/common/interfaces/IMusic';

export default async function (
    req: Request<{ music_id: string }, {}, {}, { premium: 'true' | 'false' }>,
    res: Response,
    next: NextFunction
) {
    if (!req.user) throw new AppError(StatusCodes.UNAUTHORIZED);
    logger.info('RUN');

    try {
        const music = await deleteMusic(
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
            cover_ext: await getMusicCoverExt(music.id),
            audio_ext: await getAudioExt(music.id),
        };

        return new httpResponse(res, { music: musicDTO }, 200, 'Successfully deleted music').json();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError(500));
        }
    }
}
