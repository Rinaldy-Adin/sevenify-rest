import AppError from '@/common/AppError';
import { IMusic, IMusicResponseDTO } from '@/common/interfaces/IMusic';
import { allMusic, getAudioExt, getMusicCoverExt } from '@/services/musicService';
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
        const music = await allMusic(req.user?.phpSessId, req.user?.id);
        const musicDTO : IMusicResponseDTO[] = await Promise.all(music.map(async (item) => {
            const musicDTO: IMusicResponseDTO = {
                id: item.id,
                title: item.name,
                genre: item.genre,
                owner_id: item.ownerId,
                upload_date: item.uploadDate,
                is_premium: item.isPremium,
                cover_ext: await getMusicCoverExt(item.id),
                audio_ext: await getAudioExt(item.id),
            }

            return musicDTO;
        }));

        return new httpResponse(res, {music: musicDTO}).json();
    } catch (error) {
        logger.error(error) 
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError(500));
        }
    }
}
