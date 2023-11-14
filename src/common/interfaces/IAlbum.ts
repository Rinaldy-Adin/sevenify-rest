interface ICreateAlbumRequestDTO {
    id: number;
    title: string;
    cover: File;
}

interface IAlbum {
    album_id: number;
    album_name: string;
    album_owner: number;
    album_premium: boolean;
}

interface IAlbumResponseDTO {
    id: number;
    title: string;
    owner_id: number;
    owner_name: string;
    is_premium: boolean;
}