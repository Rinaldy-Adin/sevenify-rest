import { Application, Router } from 'express';
import handleErrors from './middlewares/handleErrors';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import musicRoutes from './routes/musicRoutes';

export default function loadRoutes(app: Application): void {
    const routes = Router();

    authRoutes(routes);
    adminRoutes(routes);
    musicRoutes(routes);

    app.use('/api', routes);
    handleErrors(app);
}