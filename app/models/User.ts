import {Company} from "@/app/models/Company";

export interface User {
    id: number;
    email: string;
    name: string;
    token?: string;
    roles: Array<{ id: number; name: string }>;
    companies: Array<Company>;
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