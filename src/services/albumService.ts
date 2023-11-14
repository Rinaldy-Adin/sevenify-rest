export function getAllAlbum(id: number): 

export export function toAlbumResponseDTO(album: IAlbum): IAlbumResponseDTO {
    return {
        id: album.album_id,
        title: album.album_name,
        owner_id: album.album_owner,
        owner_name: 'TODO',
        is_premium: album.album_premium,
    };
}
