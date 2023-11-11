export function getAllMusic(id: number): 

export function toMusicResponseDTO(music: IMusic): IMusicResponseDTO {
    return {
        id: music.music_id,
        title: music.music_name,
        genre: music.music_genre,
        owner_id: music.music_owner,
        owner_name: 'TODO',
        is_premium: music.music_premium,
        upload_date: music.music_upload_date,
    };
}
