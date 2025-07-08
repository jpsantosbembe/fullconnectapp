import React, { useState, useEffect } from 'react';
import { Router } from '../models/Router';
import { DashboardService } from '../services/DashboardService';

export const useDashboardViewModel = () => {
    const [routers, setRouters] = useState<Router[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadDashboard = async (showLoading = true) => {
        if (showLoading) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }

        setError(null);

        try {
            const dashboardData = await DashboardService.getDashboard();
            setRouters(dashboardData);
        } catch (error) {
            setError('Não foi possível carregar os dados do dashboard');
            console.error('Erro ao carregar dashboard:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const refreshDashboard = async () => {
        await loadDashboard(false);
    };

    return {
        routers,
        loading,
        error,
        refreshing,
        loadDashboard,
        refreshDashboard
    };
};

const DashboardViewModelComponent = () => null;

export default DashboardViewModelComponent;