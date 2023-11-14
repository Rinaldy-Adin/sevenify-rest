import { Router } from "express";
import authenticateToken from "../middlewares/authenticateToken";
import getAllAlbumController from "@/controllers/album/getAllAlbumController";
import {
    validateCreateAlbum,
    validateGetAlbumById,
} from "../middlewares/validate";
import createAlbumController from "@/controllers/album/createAlbumController";
import deleteAlbumByIdController from "@/controllers/album/deleteAlbumByIdController";
import upload from "@/utils/multer";

export default function (app: Router) {
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
        validateGetAlbumById,
        deleteAlbumByIdController
    )
}