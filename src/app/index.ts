import express from 'express';
import cors from 'cors';
import {default as httpLogger} from 'pino-http';
import {logger} from '@/utils/logger';
import loadRoutes from '@/api';
import path from 'path';

const createServer = (): express.Application => {
    const app = express();

    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(express.json());
    app.use(httpLogger(logger))
    app.use('/cover/album', express.static(path.join(__dirname, '../../storage/covers/albums')));
    app.use('/cover/music', express.static(path.join(__dirname, '../../storage/covers/music')));
    app.use('/audio', express.static(path.join(__dirname, '../../storage/audio')));

    app.disable('x-powered-by');

    app.get('/health', (_req, res) => {
        res.send('UP');
    })
    loadRoutes(app);

    return app;
};

export {createServer};