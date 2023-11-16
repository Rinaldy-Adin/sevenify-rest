import getSoapClient from '@/clients/soapClient';
import AppError from '@/common/AppError';
import { getUserById } from '@/repositories/userRepository';
import { logger } from '@/utils/logger';
import { StatusCodes } from 'http-status-codes';
import { userById, usersByIdList } from './userService';

export async function soaphealth() {
    const soapClient = await getSoapClient();

    await soapClient.healthAsync({});
}

export async function currentFollowers(phpSessId: string, userId: number) {
    const user = await getUserById(userId);

    if (!user)
        throw new AppError(StatusCodes.BAD_REQUEST, 'User does not exist');

    if (!user.user_premium)
        throw new AppError(StatusCodes.BAD_REQUEST, 'User is not premium');

    const soapClient = await getSoapClient();

    try {
        const soapResp = await soapClient.getCurrentFollowerIdsAsync({
            premiumId: userId,
        });
        const followers = soapResp[0]?.return ?? [];
        const users = await usersByIdList(phpSessId, followers);
        return users;
    } catch (error) {
        logger.error(error);
        throw new AppError();
    }
}

export async function pendingFollowers(phpSessId: string, userId: number) {
    const user = await getUserById(userId);

    if (!user)
        throw new AppError(StatusCodes.BAD_REQUEST, 'User does not exist');

    if (!user.user_premium)
        throw new AppError(StatusCodes.BAD_REQUEST, 'User is not premium');

    const soapClient = await getSoapClient();

    try {
        const soapResp = await soapClient.getPendingFollowerIdsAsync({
            premiumId: userId,
        });
        const followers = soapResp[0]?.return ?? [];
        const users = await usersByIdList(phpSessId, followers);
        return users;
    } catch (error) {
        logger.error(error);
        throw new AppError();
    }
}

export async function deleteFollower(
    phpSessId: string,
    premiumId: number,
    followerId: number
) {
    const premiumUser = await userById(phpSessId, premiumId);

    if (!premiumUser)
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'Premium user does not exist'
        );

    if (!premiumUser.user_premium)
        throw new AppError(StatusCodes.BAD_REQUEST, 'User is not premium');

    const followerUser = await userById(phpSessId, followerId);

    if (!followerUser)
        throw new AppError(StatusCodes.BAD_REQUEST, 'Follower does not exist');

    const soapClient = await getSoapClient();

    try {
        await soapClient.unfollowAsync({ premiumId, followerId });
    } catch (error) {
        logger.error(error);
        throw new AppError();
    }
}

export async function pendingAction(
    phpSessId: string,
    premiumId: number,
    followerId: number,
    action: 'accept' | 'reject'
) {
    const premiumUser = await userById(phpSessId, premiumId);

    if (!premiumUser)
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'Premium user does not exist'
        );

    if (!premiumUser.user_premium)
        throw new AppError(StatusCodes.BAD_REQUEST, 'User is not premium');

    const followerUser = await userById(phpSessId, followerId);

    if (!followerUser)
        throw new AppError(StatusCodes.BAD_REQUEST, 'Follower does not exist');

    const soapClient = await getSoapClient();

    try {
        if (action == 'accept') {
            await soapClient.acceptAsync({ premiumId, followerId });
        } else {
            await soapClient.rejectAsync({ premiumId, followerId });
        }
    } catch (error) {
        logger.error(error);
        throw new AppError();
    }
}
