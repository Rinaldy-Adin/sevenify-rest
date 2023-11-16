import AppError from '@/common/AppError';
import { ICreateAlbumRequestDTO, IAlbumResponseDTO } from '@/common/interfaces/IAlbum';
import { addNewAlbum } from '@/services/albumService';
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
        const { title}: ICreateAlbumRequestDTO = req.body;

        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };
        
        let album;

        if (files['cover']){
            const cover = files['cover'][0];

            if (!cover.mimetype.startsWith('image/'))
                throw new AppError(
                    StatusCodes.BAD_REQUEST,
                    'Cover must be an image'
                );
            
                const coverExt = cover.originalname.split('.').pop() ?? '';

            album = await addNewAlbum(
                title,
                req.user.id,
                cover.buffer,
                coverExt
            );
        }else {
            album = await addNewAlbum(
                title,
                req.user.id,
                null,
                null
            );
        }

        const albumDTO: IAlbumResponseDTO = {
            id: album.album_id,
            title: album.album_name,
            owner_id: album.album_owner,
            is_premium: album.albums_premium,
            music_id: [],
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
