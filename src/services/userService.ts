import phpClient from '@/clients/phpClient';
import AppError from '@/common/AppError';
import { ContentType } from '@/common/enums';
import { IUserDAO, IUserJWT, IUserPHPRespDTO } from '@/common/interfaces/IUser';
import config from '@/config';
import {
    createUser,
    deleteUser,
    getPendingUserById,
    getPendingUsers,
    getUserById,
    getUserByName,
    updateUser,
} from '@/repositories/userRepository';
import { logger } from '@/utils/logger';
import { AxiosError } from 'axios';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

export const signIn = async (username: string, password: string) => {
    logger.info('Signing in user');

    let userRecord: IUserDAO | null = await getUserByName(username);
    let phpSessionId = '';

    try {
        const phpLoginResp = await phpClient.post<IUserPHPRespDTO>(
            '/login',
            { username, password },
            { headers: { 'Content-Type': ContentType.FORM_URLENCODED } }
        );
        const phpLoginData = phpLoginResp.data.data;

        if (!userRecord) {
            const createUserData = {
                user_name: phpLoginData.user_name,
                user_premium: phpLoginData.role == 'admin',
                role: phpLoginData.role,
            };
            logger.info(phpLoginData);
            userRecord = await createUser(createUserData);
        }

        const setCookieHeader = phpLoginResp.headers['set-cookie']?.filter(
            (str) => str.startsWith('PHPSESSID=')
        )[0];

        if (setCookieHeader) {
            const match = setCookieHeader.match(/PHPSESSID=([^;]+)/);

            if (match) {
                phpSessionId = match[1];
            } else {
                logger.error('PHPSESSID not found in the Set-Cookie header');
                throw new AppError();
            }
        } else {
            logger.error('Set-Cookie header not found in the response');
            throw new AppError();
        }
    } catch (error) {
        if (error instanceof AxiosError && error.response?.status == 401) {
            throw new AppError(
                StatusCodes.UNAUTHORIZED,
                'Incorrect username or password'
            );
        } else if (error instanceof AppError) {
            throw error;
        }
        throw new AppError();
    }

    const jwtBody: IUserJWT = {
        username: userRecord.user_name,
        phpSessId: phpSessionId,
        is_premium: userRecord.user_premium,
        role: userRecord.role,
    };
    const accessToken = jwt.sign(jwtBody, config.jwtSecret);

    return { user: userRecord, token: accessToken };
};

export const pendingUsers = async () => {
    logger.info('Getting pending users');
    return await getPendingUsers();
};

export const pendingAdminAction = async (userId: number, action: 'accept' | 'reject') => {
    logger.info('Acting on pending request');

    const userRecord: IUserDAO | null = await getPendingUserById(userId);

    if (userRecord == null)
        throw new AppError(StatusCodes.BAD_REQUEST, 'No user pending with given id');

    if (action == 'accept') {
        await updateUser(userId, {user_premium: true})
    } else {
        await deleteUser(userId);
    }
}