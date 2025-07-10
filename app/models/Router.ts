export interface ProviderInfo {
    id: number;
    name: string;
    logo_url_light_theme: string | null;
    logo_url_dark_theme: string | null;
}

export interface RouterInterface {
    id: number;
    router_id: number;
    provider_id: number;
    interface_name: string;
    type: string;
    link_status: string;
    last_status_change_at: string | null;
    last_checked_at: string | null;
    created_at: string;
    updated_at: string;
    provider_info: ProviderInfo;
}

export interface Router {
    id: number;
    company_id: number;
    name: string;
    ip_address_public: string;
    ip_address_intranet: string;
    api_port: number;
    api_username: string;
    status: string;
    last_seen_at: string | null;
    created_at: string;
    updated_at: string;
    api_password: string;
    company_name: string;
    interfaces: RouterInterface[];
}