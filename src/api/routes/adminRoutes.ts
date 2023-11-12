import getPendingUsersController from '@/controllers/admin/getPendingUsersController';
import { Router } from 'express';
import authenticateToken from '../middlewares/authenticateToken';
import postPendingActionController from '@/controllers/admin/postPendingActionController';
import { validatePendingAction } from '../middlewares/validate';

export default function (app: Router) {
    app.get(
        '/admin/pending',
        authenticateToken(true, 'admin'),
        getPendingUsersController
    );
    app.post(
        '/admin/pending/:user_id',
        authenticateToken(true, 'admin'),
        validatePendingAction,
        postPendingActionController
    );
}
