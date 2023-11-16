import AppError from '@/common/AppError';
import httpResponse from '@/utils/httpResponse';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IAlbumResponseDTO } from '@/common/interfaces/IAlbum';
import { albumById } from '@/services/albumService';

export default async function (
    req: Request<{album_id: string}, {}, {}, { premium: 'true' | 'false' }>,
    res: Response,
    next: NextFunction
) {
    if (!req.user) throw new AppError(StatusCodes.UNAUTHORIZED);

    try {
        const album = await albumById(
            req.user?.phpSessId,
            req.user?.id,
            parseInt(req.params.album_id),
            req.query.premium == 'true'
        );

        const albumDTO: IAlbumResponseDTO = {
            id: album.id,
            title: album.name,
            owner_id: album.ownerId,
            is_premium: album.isPremium,
            music_id: album.music_id,
        };

        return new httpResponse(res, {album: albumDTO}).json();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError(500));
        }
    }
}
