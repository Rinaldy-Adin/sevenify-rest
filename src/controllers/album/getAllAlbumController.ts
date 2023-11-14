import AppError from '@/common/AppError';
import { IAlbumResponseDTO } from '@/common/interfaces/IAlbum';
import { allAlbum } from '@/services/albumService';
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
        const album = await allAlbum(req.user?.phpSessId, req.user?.id);

        return new httpResponse(res, album.map((item => {
            const albumDTO: IAlbumResponseDTO = {
                id: item.id,
                title: item.name,
                owner_id: item.ownerId,
                is_premium: item.isPremium,
                music_id: item.musicIds,
            }

            return albumDTO;
        }))).json();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError(500));
        }
    }
}
