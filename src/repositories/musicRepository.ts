import prisma from '@/prisma';
import { Prisma } from '@prisma/client';

export async function getMusicById(musicId: number) {
    return await prisma.music.findUnique({
        where: {
            music_id: musicId,
        },
    });
}

export async function getAllMusic() {
    return await prisma.music.findMany();
}

export async function getAllMusicByUserId(userId: number) {
    return await prisma.music.findMany({
        where: {
            music_owner: userId,
        },
    });
}

export async function createMusic(data: Prisma.musicCreateInput) {
    return await prisma.music.create({
        data,
    });
}

export async function updateMusic(
    musicId: number,
    data: Prisma.musicUpdateInput
) {
    return await prisma.music.update({
        where: {
            music_id: musicId,
        },
        data,
    });
}

export async function deleteMusic(musicId: number) {
    return await prisma.music.delete({
        where: {
            music_id: musicId,
        },
    });
}
