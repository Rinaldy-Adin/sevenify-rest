import phpClient from '@/clients/phpClient';
import AppError from '@/common/AppError';
import {
    createMusic,
    getAllMusic,
    getAllMusicByUserId,
} from '@/repositories/musicRepository';
import { getUserById } from '@/repositories/userRepository';
import { logger } from '@/utils/logger';
import { StatusCodes } from 'http-status-codes';
import { promises as fs } from 'fs';
import path from 'path';

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
    audioExt: string,
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

        const audioPath = path.resolve(__dirname, '../../storage/audio', `${musicRecord.music_id}.${audioExt}`);

        const promises = [fs.writeFile(audioPath, audioBuff)]

        if (coverBuff) {
            const coverPath = path.resolve(__dirname, '../../storage/covers', `${musicRecord.music_id}.${coverExt}`);
            promises.push(fs.writeFile(coverPath, coverBuff))
        }

        await Promise.all(promises);

        return musicRecord;
    } catch (error) {
        logger.error('Error writing to file')
        logger.error(error);
        throw new AppError();
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
