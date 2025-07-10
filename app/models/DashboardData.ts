import {Router} from "@/app/models/Router";

export interface ExternalServiceStatus {
    name: string;
    status: string;
    outages: number;
}

export interface PingLatencyMetric {
    id: number;
    name: string;
    ip_address: string;
    description: string;
    logo_url_light_theme: string | null;
    logo_url_dark_theme: string | null;
    created_at: string;
    updated_at: string;
    aggregated_provider_latencies: any[]; // Pode ser detalhado mais tarde
}

export interface DashboardData {
    routers: Router[];
    connected_devices_count: number;
    external_services_status: ExternalServiceStatus[];
    ping_latency_metrics: PingLatencyMetric[];
}