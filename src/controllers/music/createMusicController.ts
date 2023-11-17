import AppError from '@/common/AppError';
import { ICreateMusicRequestDTO, IMusicResponseDTO } from '@/common/interfaces/IMusic';
import { addNewMusic, getAudioExt, getMusicCoverExt } from '@/services/musicService';
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
        const { title, genre }: ICreateMusicRequestDTO = req.body;

        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };

        if (!files['audio'])
            throw new AppError(
                StatusCodes.BAD_REQUEST,
                'Must upload music file'
            );

        const audio = files['audio'][0];

        if (!audio.mimetype.startsWith('audio/'))
            throw new AppError(
                StatusCodes.BAD_REQUEST,
                'Must submit audio file'
            );

        const audioExt = audio.originalname.split('.').pop() ?? '';

        let music;

        if (files['cover']) {
            const cover = files['cover'][0];

            if (!cover.mimetype.startsWith('image/'))
                throw new AppError(
                    StatusCodes.BAD_REQUEST,
                    'Cover must be an image'
                );

            const coverExt = cover.originalname.split('.').pop() ?? '';

            music = await addNewMusic(
                title,
                genre ?? null,
                req.user.id,
                cover.buffer,
                coverExt,
                audio.buffer,
                audioExt
            );
        } else {
            music = await addNewMusic(
                title,
                genre ?? null,
                req.user.id,
                null,
                null,
                audio.buffer,
                audioExt
            );
        }

        const musicDTO: IMusicResponseDTO = {
            id: music.music_id,
            title: music.music_name,
            genre: music.music_genre ?? '',
            owner_id: music.music_owner,
            upload_date: music.music_upload_date,
            is_premium: true,
            cover_ext: await getMusicCoverExt(music.music_id),
            audio_ext: await getAudioExt(music.music_id),
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
