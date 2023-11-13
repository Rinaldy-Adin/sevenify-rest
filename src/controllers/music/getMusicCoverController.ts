import AppError from '@/common/AppError';
import { allMusic, musicById, musicCoverBlob } from '@/services/musicService';
import httpResponse from '@/utils/httpResponse';
import { logger } from '@/utils/logger';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default async function (
    req: Request<{music_id: string}, {}, {}, { premium: 'true' | 'false' }>,
    res: Response,
    next: NextFunction
) {
    if (!req.user) throw new AppError(StatusCodes.UNAUTHORIZED);

    try {
        const coverBlob = await musicCoverBlob(
            req.user?.phpSessId,
            parseInt(req.params.music_id),
            req.query.premium == 'true'
        );

        res.setHeader('Content-Description', 'File Transfer');
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', 'inline; filename="' + `${req.params.music_id}.${coverBlob.ext}` + '"');
        res.setHeader('Expires', '0');
        res.setHeader('Cache-Control', 'must-revalidate');
        return res.send(Buffer.from(await coverBlob.blob.arrayBuffer()));
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError(500));
        }
    }
}
