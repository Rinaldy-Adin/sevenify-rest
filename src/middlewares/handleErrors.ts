import AppError from '@/common/AppError';
import { logger } from '@/utils/logger';
import { Application, NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default function handleErrors(app: Application): void {
    app.use((req: Request, res: Response, next: NextFunction) => {
        const err: AppError = new AppError(StatusCodes.NOT_FOUND);
        next(err);
    });

    app.use(
        (
            err: AppError,
            req: Request,
            res: Response,
            next: NextFunction
        ): void => {
            logger.error(err.message);
            res.status(err.status || 500);
            res.json({
                status: 'fail',
                message: `${err.message}`,
                data: null,
            });
        }
    );
}
