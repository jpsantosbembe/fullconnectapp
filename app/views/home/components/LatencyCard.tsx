// views/home/components/LatencyCard.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { Card } from 'react-native-paper';
import { PingLatencyMetric } from '../../../models/DashboardData';
import { Router } from '../../../models/Router';

// Logos fictícias para os serviços
const SERVICE_LOGOS = {
    Google: "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png",
    Amazon: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png",
    Facebook: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1200px-Facebook_Logo_%282019%29.png",
    Microsoft: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2048px-Microsoft_logo.svg.png"
};

interface LatencyCardProps {
    pingLatencyMetrics?: PingLatencyMetric[];
}

const LatencyCard: React.FC<LatencyCardProps> = ({ pingLatencyMetrics = [] }) => {
    // Estado para latências que se atualizam
    const [latencies, setLatencies] = useState({});

    // Atualizar latências a cada segundo
    useEffect(() => {
        // Inicialização
        updateLatencies();

        // Configurar intervalo para atualizar as latências
        const interval = setInterval(() => {
            updateLatencies();
        }, 1000);

        return () => clearInterval(interval);
    }, [pingLatencyMetrics]);

    // Função para atualizar as latências com valores aleatórios
    const updateLatencies = () => {
        // Usar métricas da API se disponíveis, ou dados fictícios
        const services = pingLatencyMetrics.length > 0
            ? pingLatencyMetrics.map(metric => metric.name)
            : ['Google', 'Amazon', 'Facebook', 'Microsoft'];

        const newLatencies = {};

        // Para cada serviço
        services.forEach(service => {
            newLatencies[service] = {};

            // Criar pelo menos um provider por serviço com latência aleatória
            const providerId = Math.floor(Math.random() * 1000);
            const latency = Math.floor(Math.random() * 140) + 10;

            newLatencies[service][providerId] = {
                providerId: providerId,
                providerName: 'Provider ' + providerId,
                providerLogo: null,
                latency: latency
            };

            // Adicionar um segundo provider aleatório para alguns serviços
            if (Math.random() > 0.5) {
                const providerId2 = providerId + 1;
                const latency2 = Math.floor(Math.random() * 140) + 10;

                newLatencies[service][providerId2] = {
                    providerId: providerId2,
                    providerName: 'Provider ' + providerId2,
                    providerLogo: null,
                    latency: latency2
                };
            }
        });

        setLatencies(newLatencies);
    };

    // Renderizar informações de latência agrupadas por serviço
    const renderLatencyInfo = () => {
        if (!latencies || Object.keys(latencies).length === 0) {
            return (
                <View style={styles.centerContainer}>
                    <Text>Carregando informações de latência...</Text>
                </View>
            );
        }

        // Serviços que queremos exibir
        const services = Object.keys(latencies);

        return (
            <View style={styles.servicesLatencyContainer}>
                {services.map((service, serviceIndex) => {
                    const serviceProviders = latencies[service] || {};
                    const logoUrl = SERVICE_LOGOS[service] || null;

                    return (
                        <View key={serviceIndex} style={styles.serviceLatencyGroup}>
                            {/* Logo e nome do serviço */}
                            <View style={styles.serviceHeader}>
                                {logoUrl ? (
                                    <Image
                                        source={{ uri: logoUrl }}
                                        style={styles.serviceLogo}
                                        resizeMode="contain"
                                    />
                                ) : (
                                    <View style={styles.serviceLogoPlaceholder}>
                                        <Text style={styles.serviceLogoText}>{service.charAt(0)}</Text>
                                    </View>
                                )}
                                <Text style={styles.serviceLatencyName}>{service}</Text>
                            </View>

                            {/* Lista de providers para este serviço */}
                            <View style={styles.providersLatencyList}>
                                {Object.values(serviceProviders).map((providerData: any, providerIndex) => {
                                    // Status baseado na latência
                                    let statusColor = '#4CAF50';
                                    if (providerData.latency > 100) {
                                        statusColor = '#F44336';
                                    } else if (providerData.latency > 50) {
                                        statusColor = '#FFC107';
                                    }

                                    return (
                                        <View key={providerIndex} style={styles.providerLatencyItem}>
                                            {/* Logo do provider */}
                                            {providerData.providerLogo ? (
                                                <Image
                                                    source={{ uri: providerData.providerLogo }}
                                                    style={styles.providerLatencyLogo}
                                                    resizeMode="contain"
                                                />
                                            ) : (
                                                <View style={[styles.providerLogoPlaceholder, { backgroundColor: statusColor }]}>
                                                    <Text style={styles.providerLogoInitial}>
                                                        {providerData.providerName ? providerData.providerName.charAt(0).toUpperCase() : 'P'}
                                                    </Text>
                                                </View>
                                            )}

                                            {/* Nome do provider */}
                                            <Text style={styles.providerLatencyName}>
                                                {providerData.providerName}
                                            </Text>

                                            {/* Valor de latência */}
                                            <Text style={[styles.providerLatencyValue, { color: statusColor }]}>
                                                {providerData.latency} ms
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <Card style={styles.infoCard}>
            <Card.Content>
                <Text style={styles.cardTitle}>Latência</Text>
                <View style={styles.latencyContainer}>
                    {renderLatencyInfo()}
                </View>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    infoCard: {
        margin: 8,
        marginTop: 16,
    },
    cardTitle: {
        marginBottom: 16,
        fontWeight: 'bold',
        fontSize: 20,
    },
    centerContainer: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    latencyContainer: {
        marginTop: 8,
    },
    servicesLatencyContainer: {
        gap: 20,
    },
    serviceLatencyGroup: {
        marginBottom: 8,
    },
    serviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    serviceLogo: {
        width: 80,
        height: 24,
        marginRight: 12,
    },
    serviceLogoPlaceholder: {
        width: 40,
        height: 24,
        backgroundColor: '#3578E5',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    serviceLogoText: {
        color: 'white',
        fontWeight: 'bold',
    },
    serviceLatencyName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    providersLatencyList: {
        paddingLeft: 8,
    },
    providerLatencyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
    },
    providerLatencyLogo: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 12,
    },
    providerLogoPlaceholder: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    providerLogoInitial: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    providerLatencyName: {
        flex: 1,
        fontSize: 14,
    },
    providerLatencyValue: {
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 8,
    }
});

export default LatencyCard;
