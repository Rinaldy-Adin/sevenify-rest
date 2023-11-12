import phpClient from '@/clients/phpClient';
import {
    getAllMusic,
    getAllMusicByUserId,
} from '@/repositories/musicRepository';
import { logger } from '@/utils/logger';

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

    const publicMusicResp = await phpClient.get<IMusicSearchPHPRespDTO>('/search-user', {
        params: {
            page: 0,
        },
        headers: {
            Cookie: `PHPSESSID=${phpSessId}`,
        },
    });

    const publicMusic: IMusic[] = publicMusicResp.data.data.result.map((music) => ({
        id: music.music_id,
        name: music.music_name,
        ownerId: music.music_owner_id,
        genre: music.music_genre ?? '',
        uploadDate: music.music_upload_date,
        isPremium: false,
    }));

    return [...premiumMusic, ...publicMusic];
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
