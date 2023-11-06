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
                return next(new AppError(StatusCodes.BAD_REQUEST, err.issues[0].message));
            return next(err);
        }
    };
}

const validateItemBody = validateBody(
    z.object({
        body: z.object({
            perusahaan_id: z
                .string({ required_error: 'perusahaan_id required' })
                .min(1, { message: 'perusahaan_id cannot be empty' }),
            nama: z
                .string({ required_error: 'nama required' })
                .min(1, { message: 'nama cannot be empty' }),
            harga: z
                .number({ required_error: 'harga required' })
                .int({ message: 'harga must be a round number' })
                .gt(0, 'harga must be bigger than 0'),
            stok: z
                .number({ required_error: 'stok required' })
                .int({ message: 'stok must be a round number' })
                .gt(0, 'stok must be bigger than 0'),
            kode: z
                .string({ required_error: 'kode required' })
                .min(1, { message: 'kode cannot be empty' }),
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

export { validateItemBody, validatePerusahaanBody };
