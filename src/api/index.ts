import { Application, Router } from 'express';
import handleErrors from './middlewares/handleErrors';
import authRoutes from './routes/authRoutes';

export default function loadRoutes(app: Application): void {
    const routes = Router();

    authRoutes(routes);

    app.use('/api', routes);
    handleErrors(app);
}
