interface ICreateMusicRequestDTO {
    title: string;
    genre?: string;
    cover: File;
    audio: File;
}

interface IMusic {
    id: number;
    name: string;
    ownerId: number;
    genre: string;
    uploadDate: Date;
    isPremium: boolean;
}

interface IMusicSearchPHPRespDTO {
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

interface IMusicResponseDTO {
    id: number;
    title: string;
    genre: string;
    owner_id: number;
    upload_date: Date;
    is_premium: boolean;
}
