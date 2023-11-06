import prisma from '@/prisma';
import { Prisma } from '@prisma/client';

export function getUserById(userId: number) {
    return prisma.users.findUnique({
        where: {
            user_id: userId,
        },
    });
}

export function getAllUsers() {
    return prisma.users.findMany();
}

export function getUserByName(userName: string) {
    return prisma.users.findUnique({
        where: {
            user_name: userName
        }
    });
}

export function createUser(data: Prisma.usersCreateInput) {
    return prisma.users.create({
        data,
    });
}

export function updateUser(userId: number, data: Prisma.usersUpdateInput) {
    return prisma.users.update({
        where: {
            user_id: userId,
        },
        data,
    });
}

export function deleteUser(userId: number) {
    return prisma.users.delete({
        where: {
            user_id: userId,
        },
    });
}