import { Blob } from "buffer";

export interface ICreateMusicRequestDTO {
    title: string;
    genre?: string;
    cover: File;
    audio: File;
}

export interface IUpdateMusicRequestDTO {
    title?: string;
    genre?: string;
    cover?: File;
    is_premium?: 'true' | 'false';
    delete_cover?: string;
}

export interface IMusic {
    id: number;
    name: string;
    ownerId: number;
    genre: string;
    uploadDate: Date;
    isPremium: boolean;
}

export interface IUpdateMusic {
    title?: string;
    genre?: string;
    isPremium?: boolean;
    coverBuff?: Buffer;
    coverExt?: string;
    deleteCover?: boolean;
}

export interface IMusicCover {
    blob: Blob;
    ext: string;
}

export interface IGetMusicPHPRespDTO {
    status: string;
    data: {
        music_id: number;
        music_name: string;
        music_owner: string;
        music_genre: string;
        music_upload_date: string;
    };
}

export interface IMusicSearchPHPRespDTO {
    status: string;
    data: {
        result: {
            music_id: number;
            music_name: string;
            music_owner_id: number;
            music_genre: string;
            music_upload_date: Date;
        }[];
        'page-count': number;
    };
}

export interface ICreateMusicPHPRespDTO {
    status: string;
    data: {
        music_id: number;
        music_name: string;
        music_owner: string;
        music_genre: string;
        music_upload_date: Date;
    };
}

export interface IMusicResponseDTO {
    id: number;
    title: string;
    genre: string;
    owner_id: number;
    upload_date: Date;
    is_premium: boolean;
    cover_ext: string;
    audio_ext: string;
}
