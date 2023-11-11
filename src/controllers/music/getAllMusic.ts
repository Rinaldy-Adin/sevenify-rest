import { toMusicResponseDTO } from '@/services/musicService';
import httpResponse from '@/utils/httpResponse';
import { NextFunction, Request, Response } from 'express';

export default function (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) {
    try {
        const id = parseInt(req.params.id);
        const music: IMusic;

        return new httpResponse(res, toMusicResponseDTO(music)).json();
    } catch (error) {
        next(error);
    }
}
