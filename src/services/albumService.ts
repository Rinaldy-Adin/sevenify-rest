import phpClient from "@/clients/phpClient";
import AppError from "@/common/AppError";
import {
    createAlbum,
    deleteAlbumById,
    getAlbumById,
    getAllAlbum,
    getAllAlbumByUserId,
    getAllMusicByAlbumId
} from "@/repositories/albumRepository";
import { getUserById } from "@/repositories/userRepository";
import { logger } from "@/utils/logger";
import { StatusCodes } from "http-status-codes";
import { promises as fs, readFileSync } from "fs";
import path from "path";
import { Blob } from "buffer";
import { AxiosError } from "axios";
import { glob } from "glob";
import * as FileType from "file-type";
import {
    ICreateAlbumRequestDTO,
    IAlbum,
    IAlbumSearchPHPRespDTO,
    IGetAlbumPHPRespDTO,
} from "@/common/interfaces/IAlbum";
import FormData from "form-data";
import { ContentType } from "@/common/enums";

export async function allAlbum(phpSessId: string, userId: number) {
    const premiumAlbums = await getAllAlbumByUserId(userId);

    const premiumAlbumsWithMusic = await Promise.all(premiumAlbums.map(async (album) => {
        const musicData = await getAllMusicByAlbumId(album.album_id);
        const music_id = musicData.map((music) => music.music_id);
        return {
            id: album.album_id,
            name: album.album_name,
            ownerId: album.album_owner,
            isPremium: true,
            music_id: music_id,
        };
    }
    ));
    
    const publicAlbumResp = await phpClient.get<IAlbumSearchPHPRespDTO>(
        "/search-user",
        {
            params: {
                page: 0,
            },
            headers: {
                Cookie: `PHPSESSID=${phpSessId}`,
            },
        }
    )

    const publicAlbum: IAlbum[] = publicAlbumResp.data.data.result.map(
        (album: { album_id: number; album_name: string; album_owner_id: number; album_music_id: number[] }) => ({
            id: album.album_id,
            name: album.album_name,
            ownerId: album.album_owner_id,
            isPremium: false,
            music_id: album.album_music_id
        })
    );

    return [...premiumAlbumsWithMusic, ...publicAlbum];
}

export async function addNewAlbum(
    title: string,
    ownerId: number,
    coverBuff: Buffer | null,
    coverExt: string | null,
    //music_id: number[]
){
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
        if (coverBuff){
            const coverPath = path.resolve(
                __dirname,
                '../../storage/covers/album',
                `${albumRecord.album_id}.${coverExt}`
            );
            promises.push(fs.writeFile(coverPath, coverBuff));
        }

        await Promise.all(promises);

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
    if(premium){
        const albumRecord = await getAlbumById(albumId);

        if (!albumRecord)
            throw new AppError(
                StatusCodes.BAD_REQUEST, 
                'Album does not exist'
            );

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
            music_id: albumRecord.album_music_id.map((music_id: number) => music_id),
        };

        const coverPaths = await glob(
            path.join(
                __dirname,
                `../../storage/covers/album/${albumId}.*`
            )
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
            const phpAlbumData = phpAlbumResp.data.data[0];

            const album: IAlbum = {
                id: phpAlbumData.album_id,
                name: phpAlbumData.album_name,
                ownerId: phpAlbumData.album_owner_id,
                isPremium: false,
                music_id: phpAlbumData.album_music_id,
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