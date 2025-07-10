// viewmodels/DashboardViewModel.ts
import React, { useState, useEffect } from 'react';
import { Company } from '../models/Company';
import { DashboardData } from '../models/DashboardData';
import { Router } from '../models/Router';
import { DashboardService } from '../services/DashboardService';

export const useDashboardViewModel = (initialCompanies: Company[] = []) => {
    const [companies, setCompanies] = useState<Company[]>(initialCompanies);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(
        initialCompanies.length > 0 ? initialCompanies[0] : null
    );

    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Update companies list if passed from parent component (e.g., from login)
    useEffect(() => {
        if (initialCompanies.length > 0) {
            setCompanies(initialCompanies);
            // If no company is selected yet, select the first one
            if (!selectedCompany && initialCompanies.length > 0) {
                setSelectedCompany(initialCompanies[0]);
            }
        }
    }, [initialCompanies]);

    // Load dashboard data whenever selected company changes
    useEffect(() => {
        if (selectedCompany) {
            loadDashboard();
        }
    }, [selectedCompany]);

    const loadDashboard = async (showLoading = true) => {
        if (!selectedCompany) {
            setError('Nenhuma empresa selecionada');
            return;
        }

        console.log('DashboardViewModel: loadDashboard function called for company:', selectedCompany.name);

        if (showLoading) {
            setLoading(true);
            console.log('DashboardViewModel: Setting loading to true (showLoading).');
        } else {
            setRefreshing(true);
            console.log('DashboardViewModel: Setting refreshing to true (refreshDashboard).');
        }

        setError(null);

        try {
            console.log(`DashboardViewModel: Attempting to call DashboardService.getDashboard for company ID: ${selectedCompany.id}`);
            const data = await DashboardService.getDashboard(selectedCompany.id);
            setDashboardData(data);
            console.log('DashboardViewModel: Dashboard data received and set. Number of routers:', data.routers.length);
        } catch (error: any) {
            console.error('DashboardViewModel: Error during dashboard load:', error);
            setError(error.message || 'Não foi possível carregar os dados do dashboard');
        } finally {
            setLoading(false);
            setRefreshing(false);
            console.log('DashboardViewModel: loadDashboard function finished. Loading/Refreshing set to false.');
        }
    };

    const refreshDashboard = async () => {
        console.log('DashboardViewModel: refreshDashboard function called.');
        await loadDashboard(false);
    };

    const changeCompany = (company: Company) => {
        console.log('DashboardViewModel: Changing selected company to:', company.name);
        setSelectedCompany(company);
    };

    return {
        companies,
        selectedCompany,
        changeCompany,
        dashboardData,
        routers: dashboardData?.routers || [],
        externalServicesStatus: dashboardData?.external_services_status || [],
        pingLatencyMetrics: dashboardData?.ping_latency_metrics || [],
        connectedDevicesCount: dashboardData?.connected_devices_count || 0,
        loading,
        error,
        refreshing,
        loadDashboard,
        refreshDashboard
    };
};