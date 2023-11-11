import express from 'express';
import cors from 'cors';
import {default as httpLogger} from 'pino-http';
import {logger} from '@/utils/logger';
import loadRoutes from '@/api';

const createServer = (): express.Application => {
    const app = express();

    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(express.json());
    app.use(httpLogger(logger))

    app.disable('x-powered-by');

    app.get('/health', (_req, res) => {
        res.send('UP');
    })
    loadRoutes(app);

    return app;
};

export {createServer};