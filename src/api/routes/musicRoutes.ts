import getAllMusicController from '@/controllers/music/getAllMusicController';
import { Router } from 'express';
import authenticateToken from '../middlewares/authenticateToken';
import { validateCreateMusic } from '../middlewares/validate';
import createMusicController from '@/controllers/music/createMusicController';
import upload from '@/utils/multer';

export default function (app: Router) {
    app.get(
        '/music',
        authenticateToken(true, 'user', 'admin'),
        getAllMusicController
    );
    app.post(
        '/music',
        authenticateToken(true, 'user', 'admin'),
        upload.fields([
            { name: 'cover', maxCount: 1 },
            { name: 'audio', maxCount: 1 },
        ]),
        validateCreateMusic,
        createMusicController
    );
}
