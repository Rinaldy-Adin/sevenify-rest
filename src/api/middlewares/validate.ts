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