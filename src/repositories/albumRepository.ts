import prisma from '@/prisma';
import { Prisma } from '@prisma/client';

export async function getAllAlbum() {
    return await prisma.albums.findMany();
}

export async function getAlbumById(albumId: number) {
    return await prisma.albums.findUnique({
        where: {
            album_id: albumId,
        },
    });
}

export async function getAllAlbumByUserId(userId: number) {
    return await prisma.albums.findMany({
        where: {
            album_owner: userId,
        },
    });
}

export async function createAlbum(data: Prisma.albumsCreateInput) {
    return await prisma.albums.create({
        data,
    });
}

export async function updateAlbumById(albumId: number, data: Prisma.albumsUpdateInput) {
    return await prisma.albums.update({
        where: {
            album_id: albumId,
        },
        data,
    });
}

export async function deleteAlbumById(albumId: number) {
    const album = await prisma.albums.findUnique({
        where: {
            album_id: albumId,
        },
        include: {
            album_music: true,
        },
    });

    if (!album) throw new Error('Album not found');

    await Promise.all(
        album.album_music.map(async (item) => {
            await prisma.album_music.delete({
                where: {
                    music_id_album_id: {
                        album_id: item.album_id,
                        music_id: item.music_id,
                    }
                },
            });
        })
    );

    return await prisma.albums.delete({
        where: {
            album_id: albumId,
        },
    });
}

export async function getAllMusicByAlbumId(albumId: number) {
    return await prisma.album_music.findMany({
        where: {
            album_id: albumId,
        },
    });
}

export async function createAlbumMusic(data: Prisma.album_musicCreateManyInput[]) {
    return await prisma.album_music.createMany({
        data,
    });
}