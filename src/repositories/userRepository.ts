import prisma from '@/prisma';
import { logger } from '@/utils/logger';
import { Prisma } from '@prisma/client';
import { P } from 'pino';

export async function getUserById(userId: number) {
    return await prisma.users.findUnique({
        where: {
            user_id: userId,
        },
    });
}

export async function getUsersByIdList(ids: number[]) {
    return await prisma.users.findMany({
        where: {
            user_id: {
                in: ids
            }
        }
    });
}

export async function getAllUsers() {
    return await prisma.users.findMany();
}

export async function getPendingUserById(userId: number) {
    return await prisma.users.findUnique({
        where: {
            user_premium: false,
            user_id: userId,
        },
    });
}

export async function getPendingUsers() {
    return await prisma.users.findMany({
        where: {
            user_premium: false,
        },
    });
}

export async function createUser(data: Prisma.usersCreateInput) {
    return await prisma.users.create({
        data,
    });
}

export async function updateUser(
    userId: number,
    data: Prisma.usersUpdateInput
) {
    return await prisma.users.update({
        where: {
            user_id: userId,
        },
        data,
    });
}

export async function deleteUser(userId: number) {
    return await prisma.users.delete({
        where: {
            user_id: userId,
        },
    });
}
