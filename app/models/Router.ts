import React from 'react';

export interface Provider {
    id: number;
    descricao: string;
    status: boolean;
    nome: string;
    logoUrl: string;
    routersId: number;
    routersIdRelation: number;
}

export interface Router {
    id: number;
    descricao: string;
    organizacao: string;
    licenca: string;
    usersId: number;
    usersIdRelation: number;
    providers: Provider[];
}

const RouterModelComponent = () => null;

export default RouterModelComponent;