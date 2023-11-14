import phpClient from '@/clients/phpClient';
import AppError from '@/common/AppError';
import {
    createMusic,
    deleteMusicById,
    getAllMusic,
    getAllMusicByUserId,
    getMusicById,
    updateMusicById,
} from '@/repositories/musicRepository';
import { getUserById } from '@/repositories/userRepository';
import { logger } from '@/utils/logger';
import { StatusCodes } from 'http-status-codes';
import { promises as fs, readFileSync } from 'fs';
import path from 'path';
import { Blob } from 'buffer';
import { AxiosError } from 'axios';
import { glob } from 'glob';
import * as FileType from 'file-type';
import {
    ICreateMusicPHPRespDTO,
    IGetMusicPHPRespDTO,
    IMusic,
    IMusicCover,
    IMusicSearchPHPRespDTO,
    IUpdateMusic,
} from '@/common/interfaces/IMusic';
import FormData from 'form-data';
import { ContentType } from '@/common/enums';

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
                uploadDate: new Date(phpMusicData.music_upload_date),
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

        const coverPaths = await glob(
            path.join(__dirname, `../../storage/covers/music/${musicId}.*`)
        );
        if (coverPaths.length == 1) fs.unlink(coverPaths[0]);

        const audioPaths = await glob(
            path.join(__dirname, `../../storage/audio/${musicId}.*`)
        );
        fs.unlink(audioPaths[0]);

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
                uploadDate: new Date(phpMusicData.music_upload_date),
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

export async function updateMusic(
    phpSessId: string,
    userId: number,
    musicId: number,
    premium: boolean,
    updateData: IUpdateMusic
): Promise<IMusic> {
    if (premium) {
        const musicRecord = await getMusicById(musicId);

        if (!musicRecord)
            throw new AppError(StatusCodes.BAD_REQUEST, 'Music does not exist');

        if (musicRecord.music_owner != userId)
            throw new AppError(StatusCodes.BAD_REQUEST, 'Music does not exist');

        if (updateData.isPremium == false) {
            try {
                const formData = new FormData();

                formData.append(
                    'title',
                    updateData.title ?? musicRecord.music_name
                );
                logger.info(updateData.title ?? musicRecord.music_name);

                formData.append(
                    'genre',
                    updateData.genre ?? musicRecord.music_genre
                );
                logger.info(updateData.genre ?? musicRecord.music_genre);

                if (updateData.deleteCover == true) {
                    formData.append('cover-file', '', '');
                } else if (updateData.coverBuff != undefined) {
                    formData.append('cover-file', updateData.coverBuff, '');
                } else {
                    const paths = await glob(
                        path.join(
                            __dirname,
                            `../../storage/covers/music/${musicId}.*`
                        )
                    );
                    if (paths.length == 1) {
                        const coverPath = paths[0];
                        const fileBuffer = await fs.readFile(coverPath);
                        formData.append('cover-file', fileBuffer, '');
                    } else {
                        formData.append('cover-file', '', '');
                    }
                }

                const audioPaths = await glob(
                    path.join(__dirname, `../../storage/audio/${musicId}.*`)
                );
                if (audioPaths.length == 1) {
                    const audioPath = audioPaths[0];
                    formData.append('music-file', readFileSync(audioPath), 'name.m4a');
                }

                const formHeaders = formData.getHeaders();
                const phpCreateResp =
                    await phpClient.post<ICreateMusicPHPRespDTO>(
                        `/music`,
                        formData.getBuffer(),
                        {
                            headers: {
                                Cookie: `PHPSESSID=${phpSessId}`,
                                ...formHeaders,
                            },
                        }
                    );

                const phpCreateData = phpCreateResp.data.data;

                const music: IMusic = {
                    id: phpCreateData.music_id,
                    genre: phpCreateData.music_genre ?? '',
                    isPremium: false,
                    name: phpCreateData.music_name,
                    ownerId: userId,
                    uploadDate: phpCreateData.music_upload_date,
                };

                await deleteMusic(phpSessId, userId, musicId, true);

                return music;
            } catch (error) {
                if (
                    error instanceof AxiosError &&
                    error.response?.status == 400
                )
                    throw new AppError(
                        StatusCodes.BAD_REQUEST,
                        'Cover file does not exist'
                    );
                if (error instanceof AppError) throw error;
                throw new AppError();
            }
        } else {
            const updatedRecord = await updateMusicById(musicId, {
                music_name: updateData.title,
                music_genre: updateData.genre,
            });

            if (updateData.deleteCover == true) {
                const coverPaths = await glob(
                    path.join(
                        __dirname,
                        `../../storage/covers/music/${musicId}.*`
                    )
                );
                if (coverPaths.length == 1) fs.unlink(coverPaths[0]);
            } else if (updateData.coverBuff != undefined) {
                const coverPaths = await glob(
                    path.join(
                        __dirname,
                        `../../storage/covers/music/${musicId}.*`
                    )
                );
                if (coverPaths.length == 1) fs.unlink(coverPaths[0]);

                const coverPath = path.resolve(
                    __dirname,
                    '../../storage/covers/music',
                    `${musicRecord.music_id}.${updateData.coverExt}`
                );
                await fs.writeFile(coverPath, updateData.coverBuff);
            }

            const music: IMusic = {
                id: updatedRecord.music_id,
                genre: updatedRecord.music_genre ?? '',
                isPremium: true,
                name: updatedRecord.music_name,
                ownerId: userId,
                uploadDate: updatedRecord.music_upload_date,
            };

            return music;
        }
    } else {
        let phpMusicResp: IGetMusicPHPRespDTO;
        try {
            phpMusicResp = (
                await phpClient.get<IGetMusicPHPRespDTO>(`/music/${musicId}`, {
                    headers: {
                        Cookie: `PHPSESSID=${phpSessId}`,
                    },
                })
            ).data;
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status == 400)
                throw new AppError(
                    StatusCodes.BAD_REQUEST,
                    'Music does not exist'
                );
            if (error instanceof AppError) throw error;
            throw new AppError();
        }

        const phpMusicData = phpMusicResp.data ?? {};

        if (updateData.isPremium == true) {
            const newRecord = await createMusic({
                music_name: updateData.title ?? phpMusicData.music_name,
                music_genre: updateData.genre ?? phpMusicData.music_genre,
                music_upload_date: new Date(phpMusicData.music_upload_date),
                users: {
                    connect: {
                        user_id: userId,
                    },
                },
            });

            try {
                if (updateData.deleteCover != true) {
                    const phpCoverArrayBuffer = (
                        await phpClient.get<ArrayBuffer>(
                            `/music-cover/${musicId}`,
                            {
                                headers: {
                                    Cookie: `PHPSESSID=${phpSessId}`,
                                },
                                responseType: 'arraybuffer',
                            }
                        )
                    ).data;

                    const coverPath = path.resolve(
                        __dirname,
                        '../../storage/covers/music',
                        `${newRecord.music_id}.${
                            (await FileType.fromBuffer(phpCoverArrayBuffer))
                                ?.ext
                        }`
                    );
                    fs.writeFile(coverPath, Buffer.from(phpCoverArrayBuffer));
                }
            } catch (error) {
                if (
                    error instanceof AxiosError &&
                    error.response?.status == 400
                ) {
                } else if (error instanceof AppError) {
                    throw error;
                } else throw new AppError();
            }

            try {
                const phpAudioArrayBuffer = (
                    await phpClient.get<ArrayBuffer>(`/audio/${musicId}`, {
                        headers: {
                            Cookie: `PHPSESSID=${phpSessId}`,
                        },
                        responseType: 'arraybuffer',
                    })
                ).data;

                const audioPath = path.resolve(
                    __dirname,
                    '../../storage/audio',
                    `${newRecord.music_id}.${
                        (await FileType.fromBuffer(phpAudioArrayBuffer))?.ext
                    }`
                );
                fs.writeFile(audioPath, Buffer.from(phpAudioArrayBuffer));
            } catch (error) {
                logger.error('Error getting audio file from PHP');
                if (
                    error instanceof AxiosError &&
                    error.response?.status == 400
                ) {
                    throw new AppError();
                }
                if (error instanceof AppError) throw error;
                throw new AppError();
            }

            await deleteMusic(phpSessId, userId, musicId, false);

            const music = {
                id: newRecord.music_id,
                genre: newRecord.music_genre ?? '',
                isPremium: true,
                name: newRecord.music_name,
                ownerId: newRecord.music_owner,
                uploadDate: newRecord.music_upload_date,
            };
            return music;
        } else {
            try {
                const formData = new FormData();

                formData.append(
                    'title',
                    updateData.title ?? phpMusicData.music_name
                );

                formData.append(
                    'genre',
                    updateData.genre ?? phpMusicData.music_genre
                );

                if (updateData.deleteCover == true)
                    formData.append('delete-cover', 'true');

                formData.append(
                    'cover-file',
                    updateData.coverBuff != undefined
                        ? updateData.coverBuff
                        : '',
                    ''
                );

                const formHeaders = formData.getHeaders();
                const phpUpdateResp =
                    await phpClient.post<ICreateMusicPHPRespDTO>(
                        `/update-music/${musicId}`,
                        formData.getBuffer(),
                        {
                            headers: {
                                Cookie: `PHPSESSID=${phpSessId}`,
                                ...formHeaders,
                            },
                        }
                    );

                const phpUpdateData = phpUpdateResp.data.data;

                const music: IMusic = {
                    id: phpUpdateData.music_id,
                    genre: phpUpdateData.music_genre ?? '',
                    isPremium: false,
                    name: phpUpdateData.music_name,
                    ownerId: userId,
                    uploadDate: phpUpdateData.music_upload_date,
                };

                return music;
            } catch (error) {
                logger.error(error);
                if (
                    error instanceof AxiosError &&
                    error.response?.status == 400
                )
                    throw new AppError(
                        StatusCodes.BAD_REQUEST,
                        'Update data invalid'
                    );
                if (error instanceof AppError) throw error;
                throw new AppError();
            }
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
