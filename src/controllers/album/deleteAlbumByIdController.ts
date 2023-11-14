import AppError from '@/common/AppError';
import httpResponse from '@/utils/httpResponse';
import { NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { deleteAlbum } from '@/services/albumService';
import { logger } from '@/utils/logger';
import { IAlbumResponseDTO } from '@/common/interfaces/IAlbum';

export default async function (
    req: Request<{ album_id: string }, {}, {}, { premium: 'true' | 'false' }>,
    res: Response,
    next: NextFunction
) {
    if (!req.user) throw new AppError(StatusCodes.UNAUTHORIZED);
    logger.info('RUN');

    try {
        const album = await deleteAlbum(
            req.user?.phpSessId,
            req.user?.id,
            parseInt(req.params.album_id),
            req.query.premium == 'true'
        );

        if (!album) throw new AppError(StatusCodes.NOT_FOUND);
        const albumDTO: IAlbumResponseDTO = {
            id: album.id,
            title: album.name,
            owner_id: album.ownerId,
            is_premium: album.isPremium,
            music_id: album.musicIds,
        };
        return new httpResponse(res, {album: albumDTO}, 200, 'Successfully deleted album').json();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError(500));
        }
    }
}
