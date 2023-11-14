import { AnyZodObject, ZodError, z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import AppError from '@/common/AppError';
import { StatusCodes } from 'http-status-codes';

export function validateBody(schema: AnyZodObject) {
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

export const validatePendingAction = validateBody(
    z.object({
        body: z.object({
            action: z.enum(['accept', 'reject'], {
                required_error: 'action required',
            }),
        }),
    })
);

export const validateCreateMusic = validateBody(
    z.object({
        body: z.object({
            title: z
                .string({ required_error: 'title required' })
                .min(1, { message: 'title cannot be empty' }),
            genre: z.string().nullish(),
        }),
    })
);

export const validateGetMusicById = validateBody(
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

export const validateUpdateMusicById = validateBody(
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

const validatePerusahaanBody = validateBody(
    z.object({
        body: z.object({
            nama: z
                .string({ required_error: 'nama required' })
                .min(1, { message: 'nama cannot be empty' }),
            alamat: z
                .string({ required_error: 'alamat required' })
                .min(1, { message: 'alamat cannot be empty' }),
            no_telp: z
                .string({ required_error: 'no_telp required' })
                .min(1, { message: 'no_telp cannot be empty' }),
            kode: z
                .string({ required_error: 'kode required' })
                .min(1, { message: 'kode cannot be empty' }),
        }),
    })
);
