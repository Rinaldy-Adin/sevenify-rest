import { Application } from "express";
import authenticateToken from "../middlewares/authenticateToken";

export default function (app: Application) {
    app.get(
        '/album',
        authenticateToken(true, 'user', 'admin'),
        getAllAlbumController
    );

    app.post(
        '/album',
        authenticateToken(true, 'user', 'admin'),
        upload.fields([
            { name: 'cover', maxCount: 1 },
        ]),
        validateCreateAlbum,
        createAlbumController
    );

    app.delete(
        '/album/:album_id',
        authenticateToken(true, 'user', 'admin'),
        validateDeleteAlbumById,
        deleteAlbumByIdController
    )
}