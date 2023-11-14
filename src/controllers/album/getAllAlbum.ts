import { toAlbumResponseDTO } from '@/services/albumService';
import httpResponse from '@/utils/httpResponse';
import { NextFunction, Request, Response } from 'express';

export default function (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) {
    try {
        const id = parseInt(req.params.id);
        const album: IAlbum;

        return new httpResponse(res, toAlbumResponseDTO(album)).json();
    } catch (error) {
        next(error);
    }
}
