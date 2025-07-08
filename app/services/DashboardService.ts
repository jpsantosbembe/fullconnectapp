import React from 'react';
import { Router } from '../models/Router';
import { storage } from '../utils/storage';

const API_URL = 'http://172.16.0.100:3000';

export class DashboardService {

    static async getDashboard(): Promise<Router[]> {
        try {
            const token = await storage.getToken();

            if (!token) {
                throw new Error('Token de autenticação não encontrado');
            }

            const response = await fetch(`${API_URL}/dashboard`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            console.log(response);

            if (!response.ok) {
                throw new Error('Falha ao obter dados do dashboard');
            }

            const data = await response.json();
            return data as Router[];
        } catch (error) {
            console.error('Erro ao obter dados do dashboard:', error);
            throw error;
        }
    }
}

const DashboardServiceComponent = () => null;

export default DashboardServiceComponent;