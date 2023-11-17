import AppError from '@/common/AppError';
import { IAlbumResponseDTO } from '@/common/interfaces/IAlbum';
import { allAlbum, getAlbumCoverExt } from '@/services/albumService';
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
        const albums = await allAlbum(req.user?.phpSessId, req.user?.id);
        const albumDTO: IAlbumResponseDTO[] = await Promise.all(
            albums.map(async (item) => {
                const albumDTO: IAlbumResponseDTO = {
                    id: item.id,
                    title: item.name,
                    owner_id: item.ownerId,
                    is_premium: item.isPremium,
                    music_id: item.music_id,
                    cover_ext: await getAlbumCoverExt(item.id),
                };

                return albumDTO;
            })
        );

        return new httpResponse(res, { album: albumDTO }).json();
    } catch (error) {
        logger.error(error);
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError(500));
        }
    }
}
