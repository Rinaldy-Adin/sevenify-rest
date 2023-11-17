import AppError from '@/common/AppError';
import { IAlbumResponseDTO, IUpdateAlbumRequestDTO } from '@/common/interfaces/IAlbum';
import { updateAlbum } from '@/services/albumService';
import httpResponse from '@/utils/httpResponse';
import { logger } from '@/utils/logger';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default async function (
    req: Request<{ album_id: string }, {}, {}, { premium: 'true' | 'false' }>,
    res: Response,
    next: NextFunction
) {
    if (!req.user) throw new AppError(StatusCodes.UNAUTHORIZED);
    logger.info('UPDATE')
    try {
        const {
            title,
            delete_cover,
            is_premium,
            music_id,
        }: IUpdateAlbumRequestDTO = req.body;

        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };

        let cover: Express.Multer.File | undefined = undefined;
        let coverExt: string | undefined = undefined;

        if (files['cover']) {
            cover = files['cover'][0];

            if (!cover.mimetype.startsWith('image/'))
                throw new AppError(
                    StatusCodes.BAD_REQUEST,
                    'Cover must be an image'
                );

            coverExt = cover.originalname.split('.').pop() ?? '';
        }

        const album = await updateAlbum(
            req.user.phpSessId,
            req.user.id,
            parseInt(req.params.album_id),
            req.query.premium == 'true',
            {
                title,
                isPremium: is_premium ? is_premium == 'true' : undefined,
                coverBuff: cover ? cover.buffer : undefined,
                coverExt: coverExt,
                music_id: music_id
                    ? music_id.map((id) => parseInt(id))
                    : undefined,
                deleteCover: delete_cover != undefined,
            }
        );

        const albumDTO : IAlbumResponseDTO = {
            id: album.id,
            is_premium: album.isPremium,
            owner_id: album.ownerId,
            music_id: album.music_id,
            title: album.name
        };

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
