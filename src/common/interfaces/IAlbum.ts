import { Blob } from "buffer";

export interface ICreateAlbumRequestDTO {
    title: string;
    cover: File;
    music_id: number[];
}

export interface IUpdateMusicRequestDTO {
    title?: string;
    cover?: File;
    music_id?: number[];
    is_premium?: 'true' | 'false';
    delete_cover?: string;
}

export interface IAlbum {
    id: number;
    name: string;
    ownerId: number;
    isPremium: boolean;
    musicIds: number[];
}

export interface IUpdateAlbum {
    title?: string;
    isPremium?: boolean;
    musicIds?: number[];
    coverBuff?: Buffer;
    coverExt?: string;
    deleteCover?: boolean;
}

export interface IAlbumCover {
    blob: Blob;
    ext: string;
}

export interface IAlbumResponseDTO {
    id: number;
    title: string;
    owner_id: number;
    is_premium: boolean;
    music_id: number[];
}

export interface IGetAlbumPHPRespDTO {
    status: string;
    data: {
        album_id: number;
        album_name: string;
        album_owner_id: number;
        album_music_id: number[];
    }[];
    'page-count': number;
}

export interface IAlbumSearchPHPRespDTO {
    status: string;
    data: {
        result: {
            album_id: number;
            album_name: string;
            album_owner_id: number;
            album_music_id: number[];
        }[];
        'page-count': number;
    };
}