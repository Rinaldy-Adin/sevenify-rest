import prisma from "@/prisma";
import { Prisma } from "@prisma/client";

export function getMusicById(musicId: number) {
    return prisma.music.findUnique({
        where: {
            music_id: musicId,
        },
    });
}

export function getAllMusic() {
    return prisma.music.findMany();
}

export function createMusic(data: Prisma.musicCreateInput) {
    return prisma.music.create({
        data,
    });
}

export function updateMusic(musicId: number, data: Prisma.musicUpdateInput) {
    return prisma.music.update({
        where: {
            music_id: musicId,
        },
        data,
    });
}

export function deleteMusic(musicId: number) {
    return prisma.music.delete({
        where: {
            music_id: musicId,
        },
    });
}