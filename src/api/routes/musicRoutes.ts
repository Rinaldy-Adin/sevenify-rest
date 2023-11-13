import getAllMusicController from '@/controllers/music/getAllMusicController';
import { Router } from 'express';
import authenticateToken from '../middlewares/authenticateToken';
import {
    validateCreateMusic,
    validateGetMusicById,
} from '../middlewares/validate';
import createMusicController from '@/controllers/music/createMusicController';
import upload from '@/utils/multer';
import getMusicByIdController from '@/controllers/music/getMusicByIdController';
import deleteMusicByIdController from '@/controllers/music/deleteMusicByIdController';
import getMusicCoverController from '@/controllers/music/getMusicCoverController';

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

    app.get(
        '/music/:music_id',
        authenticateToken(true, 'user', 'admin'),
        validateGetMusicById,
        getMusicByIdController
    );

    app.get(
        '/cover/music/:music_id',
        authenticateToken(true, 'user', 'admin'),
        validateGetMusicById,
        getMusicCoverController
    );

    app.delete(
        '/music/:music_id',
        authenticateToken(true, 'user', 'admin'),
        validateGetMusicById,
        deleteMusicByIdController
    );
}
