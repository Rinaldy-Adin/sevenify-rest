import prisma from '@/prisma';
import { Prisma } from '@prisma/client';

export async function getAllAlbums() {
    return await prisma.albums.findMany();
}

export async function getAlbumById(albumId: number) {
    return await prisma.albums.findUnique({
        where: {
            album_id: albumId,
        },
    });
}

export async function createAlbum(data: Prisma.albumsCreateInput) {
    return await prisma.albums.create({
        data,
    });
}

export async function updateAlbum(albumId: number, data: Prisma.albumsUpdateInput) {
    return await prisma.albums.update({
        where: {
            album_id: albumId,
        },
        data,
    });
}

export async function deleteAlbum(albumId: number) {
    return await prisma.albums.delete({
        where: {
            album_id: albumId,
        },
    });
}
