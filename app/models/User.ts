export interface User {
    id?: string;
    email: string;
    name?: string;
    token?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface LoginResponse {
    user: User;
    token: string;
}

export interface ApiLoginResponse {
    token: string;
}

const UserModelComponent = () => null;

export default UserModelComponent;