export interface IUserJWT {
    username: string;
    phpSessId: string;
}

export interface IUserDAO {
    user_id: number;
    user_name: string;
    user_premium: boolean;
    role: 'admin' | 'user';
}

export interface IUserDTO {
    username: string;
    password: string;
}

export interface IUserPHPRespDTO {
    status: string;
    data: {
        user_id: number;
        user_name: string;
        role: 'admin' | 'user';
    };
}
