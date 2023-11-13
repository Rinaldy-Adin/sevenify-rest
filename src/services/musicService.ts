import phpClient from '@/clients/phpClient';
import AppError from '@/common/AppError';
import {
    createMusic,
    deleteMusicById,
    getAllMusic,
    getAllMusicByUserId,
    getMusicById,
} from '@/repositories/musicRepository';
import { getUserById } from '@/repositories/userRepository';
import { logger } from '@/utils/logger';
import { StatusCodes } from 'http-status-codes';
import { promises as fs } from 'fs';
import path from 'path';
import { Blob } from 'buffer';
import { AxiosError } from 'axios';
import { glob } from 'glob';
import * as FileType from 'file-type';
import {
    IGetMusicPHPRespDTO,
    IMusic,
    IMusicCover,
    IMusicSearchPHPRespDTO,
} from '@/common/interfaces/IMusic';

export async function musicById(
    phpSessId: string,
    userId: number,
    musicId: number,
    premium: boolean
) {
    if (premium) {
        const musicRecord = await getMusicById(musicId);

        if (!musicRecord)
            throw new AppError(StatusCodes.BAD_REQUEST, 'Music does not exist');

        if (musicRecord.music_owner != userId)
            throw new AppError(StatusCodes.BAD_REQUEST, 'Music does not exist');

        const music: IMusic = {
            id: musicRecord.music_id,
            genre: musicRecord.music_genre ?? '',
            isPremium: true,
            name: musicRecord.music_name,
            ownerId: musicRecord.music_owner,
            uploadDate: musicRecord.music_upload_date,
        };

        return music;
    } else {
        try {
            const phpMusicResp = await phpClient.get<IGetMusicPHPRespDTO>(
                `/music/${musicId}`,
                {
                    headers: {
                        Cookie: `PHPSESSID=${phpSessId}`,
                    },
                }
            );
            const phpMusicData = phpMusicResp.data.data;

            const music: IMusic = {
                id: phpMusicData.music_id,
                genre: phpMusicData.music_genre ?? '',
                isPremium: false,
                name: phpMusicData.music_name,
                ownerId: parseInt(phpMusicData.music_owner),
                uploadDate: phpMusicData.music_upload_date,
            };

            if (music.ownerId != userId)
                throw new AppError(
                    StatusCodes.BAD_REQUEST,
                    'Music does not exist'
                );

            return music;
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status == 400)
                throw new AppError(
                    StatusCodes.BAD_REQUEST,
                    'Music does not exist'
                );
            if (error instanceof AppError) throw error;
            throw new AppError();
        }
    }
}

export async function allMusic(phpSessId: string, userId: number) {
    const premiumMusic: IMusic[] = (await getAllMusicByUserId(userId)).map(
        (music) => ({
            id: music.music_id,
            name: music.music_name,
            ownerId: music.music_owner,
            genre: music.music_genre ?? '',
            uploadDate: music.music_upload_date,
            isPremium: true,
        })
    );

    const publicMusicResp = await phpClient.get<IMusicSearchPHPRespDTO>(
        '/search-user',
        {
            params: {
                page: 0,
            },
            headers: {
                Cookie: `PHPSESSID=${phpSessId}`,
            },
        }
    );

    const publicMusic: IMusic[] = publicMusicResp.data.data.result.map(
        (music) => ({
            id: music.music_id,
            name: music.music_name,
            ownerId: music.music_owner_id,
            genre: music.music_genre ?? '',
            uploadDate: music.music_upload_date,
            isPremium: false,
        })
    );

    return [...premiumMusic, ...publicMusic];
}

export async function addNewMusic(
    title: string,
    genre: string | null,
    ownerId: number,
    coverBuff: Buffer | null,
    coverExt: string | null,
    audioBuff: Buffer,
    audioExt: string
) {
    try {
        const musicRecord = await createMusic({
            music_name: title,
            music_genre: genre,
            music_upload_date: new Date(),
            users: {
                connect: {
                    user_id: ownerId,
                },
            },
        });

        const audioPath = path.resolve(
            __dirname,
            '../../storage/audio',
            `${musicRecord.music_id}.${audioExt}`
        );

        const promises = [fs.writeFile(audioPath, audioBuff)];

        if (coverBuff) {
            const coverPath = path.resolve(
                __dirname,
                '../../storage/covers/music',
                `${musicRecord.music_id}.${coverExt}`
            );
            promises.push(fs.writeFile(coverPath, coverBuff));
        }

        await Promise.all(promises);

        return musicRecord;
    } catch (error) {
        logger.error('Error writing to file');
        logger.error(error);
        throw new AppError();
    }
}

export async function deleteMusic(
    phpSessId: string,
    userId: number,
    musicId: number,
    premium: boolean
) {
    if (premium) {
        const musicRecord = await getMusicById(musicId);

        if (!musicRecord)
            throw new AppError(StatusCodes.BAD_REQUEST, 'Music does not exist');

        if (musicRecord.music_owner != userId)
            throw new AppError(StatusCodes.BAD_REQUEST, 'Music does not exist');

        await deleteMusicById(musicId);

        const music: IMusic = {
            id: musicRecord.music_id,
            genre: musicRecord.music_genre ?? '',
            isPremium: true,
            name: musicRecord.music_name,
            ownerId: musicRecord.music_owner,
            uploadDate: musicRecord.music_upload_date,
        };

        const musicPaths = await glob(
            path.join(__dirname, `../../storage/covers/music/${musicId}.*`)
        );
        if (musicPaths.length == 1) fs.unlink(musicPaths[0]);

        const audioPaths = await glob(
            path.join(__dirname, `../../storage/audio/${musicId}.*`)
        );
        fs.unlink(audioPaths[0])

        return music;
    } else {
        try {
            const phpMusicResp = await phpClient.get<IGetMusicPHPRespDTO>(
                `/music/${musicId}`,
                {
                    headers: {
                        Cookie: `PHPSESSID=${phpSessId}`,
                    },
                }
            );
            const phpMusicData = phpMusicResp.data.data;

            const music: IMusic = {
                id: phpMusicData.music_id,
                genre: phpMusicData.music_genre ?? '',
                isPremium: false,
                name: phpMusicData.music_name,
                ownerId: parseInt(phpMusicData.music_owner),
                uploadDate: phpMusicData.music_upload_date,
            };

            if (music.ownerId != userId)
                throw new AppError(
                    StatusCodes.BAD_REQUEST,
                    'Music does not exist'
                );

            await phpClient.delete(`/music/${musicId}`, {
                headers: {
                    Cookie: `PHPSESSID=${phpSessId}`,
                },
            });

            return music;
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status == 400)
                throw new AppError(
                    StatusCodes.BAD_REQUEST,
                    'Music does not exist'
                );
            if (error instanceof AppError) throw error;
            throw new AppError();
        }
    }
}

export async function musicCoverBlob(
    phpSessId: string,
    musicId: number,
    premium: boolean
): Promise<IMusicCover> {
    if (premium) {
        const paths = await glob(
            path.join(__dirname, `../../storage/covers/music/${musicId}.*`)
        );
        if (paths.length < 1)
            throw new AppError(
                StatusCodes.NOT_FOUND,
                'Cover file doesnt exist'
            );

        const coverPath = paths[0];
        const fileBuffer = await fs.readFile(coverPath);

        return {
            blob: new Blob([fileBuffer]),
            ext: (await FileType.fromBuffer(fileBuffer))?.ext ?? '',
        };
    } else {
        try {
            const phpCoverArrayBuffer = await phpClient.get<ArrayBuffer>(
                `/music-cover/${musicId}`,
                {
                    headers: {
                        Cookie: `PHPSESSID=${phpSessId}`,
                    },
                    responseType: 'arraybuffer',
                }
            );
            const fileBuffer = Buffer.from(phpCoverArrayBuffer.data);

            return {
                blob: new Blob([fileBuffer]),
                ext: (await FileType.fromBuffer(fileBuffer))?.ext ?? '',
            };
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status == 400)
                throw new AppError(
                    StatusCodes.BAD_REQUEST,
                    'Cover file does not exist'
                );
            if (error instanceof AppError) throw error;
            throw new AppError();
        }
    }
}

// export function toMusicResponseDTO(music: IMusic): IMusicResponseDTO {
//     return {
//         id: music.music_id,
//         title: music.music_name,
//         genre: music.music_genre,
//         owner_id: music.music_owner,
//         owner_name: 'TODO',
//         is_premium: music.music_premium,
//         upload_date: music.music_upload_date,
//     };
// }
