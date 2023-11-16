import AppError from '@/common/AppError';
import { IMusicResponseDTO } from '@/common/interfaces/IMusic';
import { soaphealth } from '@/services/followerService';
import { musicById } from '@/services/musicService';
import httpResponse from '@/utils/httpResponse';
import { logger } from '@/utils/logger';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        await soaphealth();
        return new httpResponse(res, {"soap_status": 'healthy'}).json();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError(500));
        }
    }
}
