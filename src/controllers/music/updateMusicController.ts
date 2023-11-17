import AppError from '@/common/AppError';
import {
    ICreateMusicRequestDTO,
    IMusicResponseDTO,
    IUpdateMusicRequestDTO,
} from '@/common/interfaces/IMusic';
import { addNewMusic, getAudioExt, getMusicCoverExt, updateMusic } from '@/services/musicService';
import httpResponse from '@/utils/httpResponse';
import { logger } from '@/utils/logger';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default async function (
    req: Request<{ music_id: string }, {}, {}, { premium: 'true' | 'false' }>,
    res: Response,
    next: NextFunction
) {
    if (!req.user) throw new AppError(StatusCodes.UNAUTHORIZED);
    try {
        const {
            title,
            genre,
            is_premium,
            delete_cover,
        }: IUpdateMusicRequestDTO = req.body;

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

        const music = await updateMusic(
            req.user?.phpSessId,
            req.user.id,
            parseInt(req.params.music_id),
            req.query.premium == 'true',
            {
                title,
                genre,
                isPremium: is_premium ? is_premium == 'true' : undefined,
                coverBuff: cover ? cover.buffer : undefined,
                coverExt: coverExt,
                deleteCover: delete_cover != undefined,
            }
        );

        const musicDTO: IMusicResponseDTO = {
            id: music.id,
            title: music.name,
            genre: music.genre ?? '',
            owner_id: music.ownerId,
            upload_date: music.uploadDate,
            is_premium: music.isPremium,
            cover_ext: await getMusicCoverExt(music.id),
            audio_ext: await getAudioExt(music.id),
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
