import phpClient from '@/clients/phpClient';
import AppError from '@/common/AppError';
import {
    createAlbum,
    deleteAlbumById,
    getAlbumById,
    getAllAlbum,
    getAllAlbumByUserId,
    getAllMusicByAlbumId,
    createAlbumMusic,
    updateAlbumById,
    deleteAlbumMusicByAlbumId,
} from '@/repositories/albumRepository';
import { getUserById } from '@/repositories/userRepository';
import { logger } from '@/utils/logger';
import { StatusCodes } from 'http-status-codes';
import { promises as fs, readFileSync } from 'fs';
import path, { parse } from 'path';
import { Blob } from 'buffer';
import { AxiosError, all } from 'axios';
import { glob } from 'glob';
import * as FileType from 'file-type';
import {
    ICreateAlbumRequestDTO,
    IAlbum,
    IAlbumSearchPHPRespDTO,
    IGetAlbumPHPRespDTO,
    IAlbumMusicPHPRespDTO,
    IUpdateAlbum,
} from '@/common/interfaces/IAlbum';
import FormData from 'form-data';
import { ContentType } from '@/common/enums';
import { error } from 'console';
import { get } from 'http';
import { updateMusic } from './musicService';
import { createMusic } from '@/repositories/musicRepository';

export async function allAlbum(phpSessId: string, userId: number) {
    const premiumAlbums = await getAllAlbumByUserId(userId);

    const premiumAlbumsWithMusic = await Promise.all(
        premiumAlbums.map(async (album) => {
            const musicData = await getAllMusicByAlbumId(album.album_id);
            const music_id = musicData.map((music) => music.music_id);
            return {
                id: album.album_id,
                name: album.album_name,
                ownerId: album.album_owner,
                isPremium: true,
                music_id: music_id,
            };
        })
    );

    const publicAlbumResp = await phpClient.get<IAlbumSearchPHPRespDTO>(
        '/search-album-user',
        {
            params: {
                page: 0,
            },
            headers: {
                Cookie: `PHPSESSID=${phpSessId}`,
            },
        }
    );
    const publicAlbumData = publicAlbumResp.data.data.result;

    const publicAlbum: IAlbum[] = await Promise.all(
        publicAlbumData.map(async (album): Promise<IAlbum> => {
            const albumMusicResp = await phpClient.get<IAlbumMusicPHPRespDTO>(
                '/album-music/' + album.album_id,
                {
                    headers: {
                        Cookie: `PHPSESSID=${phpSessId}`,
                    },
                }
            );
            return {
                id: album.album_id,
                name: album.album_name,
                isPremium: false,
                music_id: albumMusicResp.data.data.map(
                    (music) => music.music_id
                ),
                ownerId: album.album_owner_id,
            };
        })
    );

    return [...premiumAlbumsWithMusic, ...publicAlbum];
}

export async function addNewAlbum(
    title: string,
    ownerId: number,
    coverBuff: Buffer | null,
    coverExt: string | null,
    music_id: number[]
) {
    try {
        const albumRecord = await createAlbum({
            album_name: title,
            users: {
                connect: {
                    user_id: ownerId,
                },
            },
        });

        const promises = [];
        if (coverBuff) {
            const coverPath = path.resolve(
                __dirname,
                '../../storage/covers/albums',
                `${albumRecord.album_id}.${coverExt}`
            );
            promises.push(fs.writeFile(coverPath, coverBuff));
        }

        await Promise.all(promises);

        if (music_id.length > 0) {
            const albumMusicData = music_id.map((music_id) => ({
                album_id: albumRecord.album_id,
                music_id,
            }));

            await createAlbumMusic(albumMusicData);
        }

        return albumRecord;
    } catch (error) {
        logger.error('Error writing album to database');
        logger.error(error);
        throw new AppError();
    }
}

export async function deleteAlbum(
    phpSessId: string,
    userId: number,
    albumId: number,
    premium: boolean
) {
    if (premium) {
        const albumRecord = await getAlbumById(albumId);

        if (!albumRecord)
            throw new AppError(StatusCodes.BAD_REQUEST, 'Album does not exist');

        if (albumRecord.album_owner != userId)
            throw new AppError(
                StatusCodes.FORBIDDEN,
                'You are not the owner of this album'
            );

        await deleteAlbumById(albumId);

        const album: IAlbum = {
            id: albumRecord.album_id,
            name: albumRecord.album_name,
            ownerId: albumRecord.album_owner,
            isPremium: true,
            music_id: [],
        };

        const coverPaths = await glob(
            path.join(__dirname, `../../storage/covers/albums/${albumId}.*`)
        );

        if (coverPaths.length == 1) fs.unlink(coverPaths[0]);

        return album;
    } else {
        try {
            const phpAlbumResp = await phpClient.get<IGetAlbumPHPRespDTO>(
                `/album/${albumId}`,
                {
                    headers: {
                        Cookie: `PHPSESSID=${phpSessId}`,
                    },
                }
            );
            const phpAlbumData = phpAlbumResp.data.data;

            const album: IAlbum = {
                id: parseInt(phpAlbumData.album_id),
                name: phpAlbumData.album_name,
                ownerId: parseInt(phpAlbumData.album_owner),
                isPremium: false,
                music_id: [],
            };

            if (album.ownerId != userId)
                throw new AppError(
                    StatusCodes.BAD_REQUEST,
                    'You are not the owner of this album'
                );

            await phpClient.delete(`/album/${albumId}`, {
                headers: {
                    Cookie: `PHPSESSID=${phpSessId}`,
                },
            });

            return album;
        } catch (error) {
            logger.error(error);
            if (error instanceof AxiosError && error.response?.status == 400)
                throw new AppError(
                    StatusCodes.BAD_REQUEST,
                    'Album does not exist'
                );

            if (error instanceof AppError) throw error;
            throw new AppError();
        }
    }
}

export async function albumById(
    phpSessId: string,
    userId: number,
    albumId: number,
    premium: boolean
) {
    if (premium) {
        const albumRecord = await getAlbumById(albumId);

        if (!albumRecord)
            throw new AppError(StatusCodes.BAD_REQUEST, 'Album does not exist');

        if (albumRecord.album_owner != userId)
            throw new AppError(
                StatusCodes.FORBIDDEN,
                'You are not the owner of this album'
            );

        const albumMusic = await getAllMusicByAlbumId(albumId);

        const album: IAlbum = {
            id: albumRecord.album_id,
            name: albumRecord.album_name,
            ownerId: albumRecord.album_owner,
            isPremium: true,
            music_id: albumMusic.map((music) => music.music_id),
        };

        return album;
    } else {
        try {
            const phpAlbumResp = await phpClient.get<IGetAlbumPHPRespDTO>(
                `/album/${albumId}`,
                {
                    headers: {
                        Cookie: `PHPSESSID=${phpSessId}`,
                    },
                }
            );

            const albumMusicResp = await phpClient.get<IAlbumMusicPHPRespDTO>(
                '/album-music/' + albumId,
                {
                    headers: {
                        Cookie: `PHPSESSID=${phpSessId}`,
                    },
                }
            );

            const phpAlbumData = phpAlbumResp.data.data;
            const phpMusicData = albumMusicResp.data.data;

            const album: IAlbum = {
                id: parseInt(phpAlbumData.album_id),
                name: phpAlbumData.album_name,
                ownerId: parseInt(phpAlbumData.album_owner),
                isPremium: false,
                music_id: phpMusicData.map((music) => music.music_id),
            };

            if (album.ownerId != userId)
                throw new AppError(
                    StatusCodes.BAD_REQUEST,
                    'You are not the owner of this album'
                );

            return album;
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status == 400)
                throw new AppError(
                    StatusCodes.BAD_REQUEST,
                    'Album does not exist'
                );

            if (error instanceof AppError) throw error;
            throw new AppError();
        }
    }
}

export async function updateAlbum(
    phpSessId: string,
    userId: number,
    albumId: number,
    premium: boolean,
    updateData: IUpdateAlbum
): Promise<IAlbum> {
    if (premium) {
        const albumRecord = await getAlbumById(albumId);

        if (!albumRecord)
            throw new AppError(StatusCodes.BAD_REQUEST, 'Album does not exist');

        if (albumRecord.album_owner != userId)
            throw new AppError(StatusCodes.BAD_REQUEST, 'Album does not exist');

        if (updateData.isPremium == false) {
            try {
                const formData = new FormData();

                formData.append(
                    'title',
                    updateData.title ?? albumRecord.album_name
                );

                if (updateData.deleteCover == true) {
                    formData.append('cover-file', '', '');
                } else if (updateData.coverBuff != undefined) {
                    formData.append('cover-file', updateData.coverBuff, '');
                } else {
                    const paths = await glob(
                        path.join(
                            __dirname,
                            `../../storage/covers/albums/${albumId}.*`
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

                const formHeaders = formData.getHeaders();
                const phpCreateResp = await phpClient.post<IGetAlbumPHPRespDTO>(
                    `/create-album`,
                    formData.getBuffer(),
                    {
                        headers: {
                            Cookie: `PHPSESSID=${phpSessId}`,
                            ...formHeaders,
                        },
                    }
                );

                const updatedMusicIds = updateData.music_id ?? [];
                await Promise.all(
                    updatedMusicIds.map(async (premiumMusicId) => {
                        const publicMusic = await updateMusic(
                            phpSessId,
                            userId,
                            premiumMusicId,
                            true,
                            { isPremium: false }
                        );
                        formData.append('music[]', publicMusic.id);
                    })
                );

                const phpCreateData = phpCreateResp.data.data;

                await phpClient.post(
                    '/update-album/' + phpCreateData.album_id,
                    formData.getBuffer(),
                    {
                        headers: {
                            Cookie: `PHPSESSID=${phpSessId}`,
                            ...formHeaders,
                        },
                    }
                );

                const music: IAlbum = {
                    id: parseInt(phpCreateData.album_id),
                    isPremium: false,
                    name: phpCreateData.album_name,
                    ownerId: userId,
                    music_id: updateData.music_id ?? [],
                };

                await deleteAlbum(phpSessId, userId, albumId, true);

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
            const updateDataMusicIds = updateData.music_id ?? [];
            await deleteAlbumMusicByAlbumId(albumId);
            const updatedRecord = await updateAlbumById(albumId, {
                album_name: updateData.title,
                album_music: {
                    create: updateDataMusicIds.map((id) => ({ music_id: id })),
                },
            });

            if (updateData.deleteCover == true) {
                const coverPaths = await glob(
                    path.join(
                        __dirname,
                        `../../storage/covers/albums/${albumId}.*`
                    )
                );
                if (coverPaths.length == 1) fs.unlink(coverPaths[0]);
            } else if (updateData.coverBuff != undefined) {
                const coverPaths = await glob(
                    path.join(
                        __dirname,
                        `../../storage/covers/albums/${albumId}.*`
                    )
                );
                if (coverPaths.length == 1) fs.unlink(coverPaths[0]);

                const coverPath = path.resolve(
                    __dirname,
                    '../../storage/covers/albums',
                    `${albumRecord.album_id}.${updateData.coverExt}`
                );
                await fs.writeFile(coverPath, updateData.coverBuff);
            }

            const music: IAlbum = {
                id: updatedRecord.album_id,
                isPremium: true,
                name: updatedRecord.album_name,
                ownerId: userId,
                music_id: updateDataMusicIds,
            };

            return music;
        }
    } else {
        let phpAlbumResp: IGetAlbumPHPRespDTO;
        try {
            phpAlbumResp = (
                await phpClient.get<IGetAlbumPHPRespDTO>(`/album/${albumId}`, {
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

        const phpAlbumData = phpAlbumResp.data ?? {};

        if (updateData.isPremium == true) {
            const phpAlbumMusicResp =
                await phpClient.get<IAlbumMusicPHPRespDTO>(
                    `/album-music/${albumId}`,
                    {
                        headers: {
                            Cookie: `PHPSESSID=${phpSessId}`,
                        },
                    }
                );
            const phpAlbumMusicData = phpAlbumMusicResp.data.data;


            const updateDataMusicIds = await Promise.all(phpAlbumMusicData.map(async (music) => {
                const musicRecord = await createMusic({
                    music_name: music.music_name,
                    music_genre: music.music_genre,
                    music_upload_date: new Date(music.music_upload_date),
                    users: {
                        connect: {
                            user_id: parseInt(music.music_owner),
                        },
                    },
                });

                return musicRecord.music_id
            }));

            const newRecord = await createAlbum({
                album_name: updateData.title ?? phpAlbumData.album_name,
                users: {
                    connect: {
                        user_id: userId,
                    },
                },
                album_music: {
                    createMany: {
                        data: updateDataMusicIds.map((id) => ({
                            music_id: id,
                        })),
                    },
                },
            });

            try {
                if (updateData.deleteCover != true) {
                    const phpCoverArrayBuffer = (
                        await phpClient.get<ArrayBuffer>(
                            `/album-cover/${albumId}`,
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
                        '../../storage/covers/albums',
                        `${newRecord.album_id}.${
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

            await deleteAlbum(phpSessId, userId, albumId, false);

            const album: IAlbum = {
                id: newRecord.album_id,
                isPremium: true,
                name: newRecord.album_name,
                ownerId: newRecord.album_owner,
                music_id: updateData.music_id ?? [],
            };
            return album;
        } else {
            try {
                const formData = new FormData();

                formData.append(
                    'title',
                    updateData.title ?? phpAlbumData.album_name
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

                const updatedMusicIds = updateData.music_id ?? [];
                updatedMusicIds.forEach((publicMusicId) => {
                    formData.append('music[]', publicMusicId);
                });

                const formHeaders = formData.getHeaders();
                const phpUpdateResp = await phpClient.post<IGetAlbumPHPRespDTO>(
                    `/update-album/${albumId}`,
                    formData.getBuffer(),
                    {
                        headers: {
                            Cookie: `PHPSESSID=${phpSessId}`,
                            ...formHeaders,
                        },
                    }
                );

                const phpUpdateData = phpUpdateResp.data.data;

                const album: IAlbum = {
                    id: parseInt(phpUpdateData.album_id),
                    isPremium: false,
                    name: phpUpdateData.album_name,
                    ownerId: userId,
                    music_id: updateData.music_id ?? [],
                };

                return album;
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
