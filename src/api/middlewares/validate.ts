import { AnyZodObject, ZodError, z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import AppError from '@/common/AppError';
import { StatusCodes } from 'http-status-codes';

export function validateRequest(schema: AnyZodObject) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        } catch (err) {
            if (err instanceof ZodError)
                return next(
                    new AppError(StatusCodes.BAD_REQUEST, err.issues[0].message)
                );
            return next(err);
        }
    };
}

export const validateCreateMusic = validateRequest(
    z.object({
        body: z.object({
            title: z
                .string({ required_error: 'title required' })
                .min(1, { message: 'title cannot be empty' }),
            genre: z.string().nullish(),
        }),
    })
);

export const validateGetMusicById = validateRequest(
    z.object({
        params: z.object({
            music_id: z
                .string({ required_error: 'music id required' })
                .refine((data) => Number.isInteger(Number(data)), {
                    message: 'music id must be an integer',
                }),
        }),
        query: z.object({
            premium: z.enum(['true', 'false'], {
                required_error: 'Premium required',
            }),
        }),
    })
);

export const validateUpdateMusicById = validateRequest(
    z.object({
        params: z.object({
            music_id: z
                .string({ required_error: 'music id required' })
                .refine((data) => Number.isInteger(Number(data)), {
                    message: 'music id must be an integer',
                }),
        }),
        query: z.object({
            premium: z.enum(['true', 'false'], {
                required_error: 'Premium required',
            }),
        }),
        body: z.object({
            title: z
                .string()
                .min(1, { message: 'title cannot be empty' })
                .nullish(),
            genre: z.string().nullish(),
            is_premium: z.enum(['true', 'false']).nullish(),
        }),
    })
);

export const validatePendingAction = validateRequest(
    z.object({
        params: z.object({
            follower_id: z
                .string({ required_error: 'Follower id required' })
                .refine((data) => Number.isInteger(Number(data)), {
                    message: 'Follower id must be an integer',
                }),
        }),
        body: z.object({
            action: z.enum(['accept', 'reject'], {
                required_error: 'Action required',
            }),
        }),
    })
);

export const validateCreateAlbum = validateBody(
    z.object({
        body: z.object({
            title: z
                .string({ required_error: 'title required' })
                .min(1, { message: 'title cannot be empty' }),        }),
    })
);

export const validateGetAlbumById = validateBody(
    z.object({
        params: z.object({
            album_id: z
                .string({ required_error: 'album id required' })
                .refine((data) => Number.isInteger(Number(data)), {
                    message: 'album id must be an integer',
                }),
        }),
        query: z.object({
            premium: z.enum(['true', 'false'], {
                required_error: 'Premium required',
            }),
        }),
    })
);