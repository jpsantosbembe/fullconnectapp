import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Text } from 'react-native';
import { Card } from 'react-native-paper';
import { ExternalServiceStatus } from '../../../models/DashboardData';

interface DowndetectorCardProps {
    serviceStatus?: ExternalServiceStatus[];
}

const DowndetectorCard: React.FC<DowndetectorCardProps> = ({ serviceStatus = [] }) => {
    // Animação para pulsar no Downdetector
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0.6)).current;

    // Dados padrão para usar se não houver dados da API
    const defaultServices: ExternalServiceStatus[] = [
        { name: 'Google', status: 'Normal', outages: 0 },
        { name: 'Amazon', status: 'Problemas', outages: 12 },
        { name: 'Facebook', status: 'Interrupção', outages: 37 },
        { name: 'Microsoft', status: 'Normal', outages: 2 },
    ];

    // Usar dados da API se disponíveis, caso contrário, usar os dados padrão
    const services = serviceStatus.length > 0 ? serviceStatus : defaultServices;

    // Criar animação de pulso para o Downdetector
    useEffect(() => {
        // Criar animação pulsante
        Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(opacityAnim, {
                        toValue: 0.2,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 0.6,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                ]),
            ])
        ).start();
    }, []);

    // Função para determinar a cor baseada no status
    const getStatusColor = (status: string) => {
        switch(status.toLowerCase()) {
            case 'normal':
                return '#4CAF50';
            case 'problemas':
                return '#FFC107';
            case 'interrupção':
            case 'interrupcao':
                return '#F44336';
            default:
                return '#4CAF50';
        }
    };

    // Renderizar informações do Downdetector com animação
    const renderDowndetectorInfo = () => {
        return (
            <View style={styles.servicesContainer}>
                {services.map((service, index) => {
                    const statusColor = getStatusColor(service.status);

                    return (
                        <View key={index} style={styles.serviceItem}>
                            <View style={styles.statusContainer}>
                                {/* Halo animado */}
                                <Animated.View
                                    style={[
                                        styles.statusHalo,
                                        {
                                            backgroundColor: statusColor,
                                            transform: [{ scale: pulseAnim }],
                                            opacity: opacityAnim
                                        }
                                    ]}
                                />
                                {/* Indicador fixo */}
                                <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
                            </View>
                            <View style={styles.serviceInfo}>
                                <Text style={styles.serviceName}>{service.name}</Text>
                                <Text style={styles.serviceStatus}>{service.status}</Text>
                            </View>
                            <Text style={styles.outageCount}>{service.outages}</Text>
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <Card style={styles.infoCard}>
            <Card.Content>
                <Text style={styles.cardTitle}>Downdetector</Text>
                <View style={styles.downdetectorContainer}>
                    {renderDowndetectorInfo()}
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
    downdetectorContainer: {
        marginTop: 8,
    },
    servicesContainer: {
        gap: 12,
    },
    serviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    statusContainer: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    statusHalo: {
        width: 12,
        height: 12,
        borderRadius: 6,
        position: 'absolute',
    },
    statusIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#fff',
        position: 'absolute',
        zIndex: 2,
    },
    serviceInfo: {
        flex: 1,
    },
    serviceName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    serviceStatus: {
        fontSize: 14,
        color: '#666',
    },
    outageCount: {
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default DowndetectorCard;
