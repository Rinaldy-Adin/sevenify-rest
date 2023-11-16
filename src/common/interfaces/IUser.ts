export interface IUserJWT {
    id: number;
    username: string;
    is_premium: boolean;
    role: 'admin' | 'user';
    phpSessId: string;
}

export interface IUserDAO {
    user_id: number;
    user_name: string;
    user_premium: boolean;
    role: 'admin' | 'user';
}

export interface IUserLoginReqDTO {
    username: string;
    password: string;
}

export interface IUserActionReqDTO {
    action: 'accept' | 'reject';
}

export interface IUserRespDTO {
    user_id: number;
    user_name: string;
    is_premium: boolean;
    role: 'admin' | 'user';
}

export interface IUserPHPRespDTO {
    status: string;
    data: {
        user_id: string;
        user_name: string;
        role: 'admin' | 'user';
    };
}

export interface IPendingFollowerAction {
    action: 'accept' | 'reject'
}