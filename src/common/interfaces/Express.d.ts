import { IUserJWT } from './IUser';

declare global {
    namespace Express {
        export interface Request {
            user?: IUserJWT;
        }
    }
}
