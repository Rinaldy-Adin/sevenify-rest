import { Router } from 'express';
import authenticateToken from '../middlewares/authenticateToken';
import soapHealthController from '@/controllers/follower/soapHealthController';
import getCurrentFollowersController from '@/controllers/follower/getCurrentFollowersController';
import getPendingFollowersController from '@/controllers/follower/getPendingFollowersController';
import deleteCurrentFollowersController from '@/controllers/follower/deleteCurrentFollowersController';
import { validatePendingAction } from '../middlewares/validate';
import pendingActionController from '@/controllers/follower/pendingActionController';

export default function (app: Router) {
    app.get('/soaphealth', soapHealthController)

    app.get('/followers/current', 
        authenticateToken(true, 'user', 'admin'),
        getCurrentFollowersController)

    app.get('/followers/pending', 
        authenticateToken(true, 'user', 'admin'),
        getPendingFollowersController)

    app.delete('/followers/current/:follower_id',
        authenticateToken(true, 'user', 'admin'),
        deleteCurrentFollowersController)

    app.post('/followers/pending/:follower_id',
        authenticateToken(true, 'user', 'admin'),
        validatePendingAction,
        pendingActionController)
}
