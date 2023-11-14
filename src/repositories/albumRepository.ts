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
    return await prisma.albums.delete({
        where: {
            album_id: albumId,
        },
    });
}
