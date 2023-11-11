interface ICreateMusicRequestDTO {
    id: number;
    title: string;
    genre: string;
    cover: File;
    audio: File;
}

interface IMusic {
    music_id: number;
    music_name: string;
    music_owner: number;
    music_genre: string;
    music_upload_date: Date;
    music_premium: boolean;
}

interface IMusicResponseDTO {
    id: number;
    title: string;
    genre: string;
    owner_id: number;
    owner_name: string;
    upload_date: Date;
    is_premium: boolean;
}