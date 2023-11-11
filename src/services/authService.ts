import phpClient from '@/clients/phpClient';
import AppError from '@/common/AppError';
import { ContentType } from '@/common/enums';
import { IUser, IUserDAO, IUserPHPRespDTO } from '@/common/interfaces/IUser';
import config from '@/config';
import { createUser, getUserByName } from '@/repositories/userRepository';
import { logger } from '@/utils/logger';
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
                user_premium: false,
                role: phpLoginData.role
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
        logger.error(error);
        throw new AppError();
    }

    const accessToken = jwt.sign({
        username: userRecord.user_name,
        phpSessId: phpSessionId
    }, config.jwtSecret)

    return {user: userRecord, token: accessToken};
};
