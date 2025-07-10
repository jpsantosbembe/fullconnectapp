// services/DashboardService.ts
import { DashboardData } from '../models/DashboardData';
import { authGet } from './authClient';

export class DashboardService {
    static async getDashboard(companyId: number): Promise<DashboardData> {
        console.log('DashboardService: getDashboard function called for company ID:', companyId);
        try {
            console.log(`DashboardService: Attempting to call authGet for /dashboard/${companyId}.`);
            const data = await authGet(`/dashboard/${companyId}`);
            console.log('DashboardService: Response received from authGet for /dashboard/', data);
            return data as DashboardData;
        } catch (error: any) {
            console.error('DashboardService: Error during getDashboard:', error);
            throw new Error(error.message || 'Não foi possível carregar os dados do dashboard');
        }
    }
}