import { Prisma } from '@prisma/client';
import prisma from '@/prisma';

export function getAllAlbums() {
    return prisma.albums.findMany();
}

export function getAlbumById(albumId: number) {
    return prisma.albums.findUnique({
        where: {
            album_id: albumId,
        },
    });
}

export function createAlbum(data: Prisma.albumsCreateInput) {
    return prisma.albums.create({
        data,
    });
}

export function updateAlbum(albumId: number, data: Prisma.albumsUpdateInput) {
    return prisma.albums.update({
        where: {
            album_id: albumId,
        },
        data,
    });
}

export function deleteAlbum(albumId: number) {
    return prisma.albums.delete({
        where: {
            album_id: albumId,
        },
    });
}