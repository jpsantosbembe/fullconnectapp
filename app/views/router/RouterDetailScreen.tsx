import React, { useEffect, useState } from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView } from 'react-native';
import {
    Text,
    Button,
    useTheme,
    Appbar,
    Card,
    Divider,
    ActivityIndicator,
    List,
    Chip
} from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Router, RouterInterface } from '../../models/Router';
import { useDashboardViewModel } from '../../viewmodels/DashboardViewModel';

type RouterDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RouterDetail'>;
type RouterDetailRouteProp = RouteProp<RootStackParamList, 'RouterDetail'>;

const formatBitsToReadable = (bits: string | number): string => {
    const bitsNum = typeof bits === 'string' ? parseInt(bits, 10) : bits;

    if (bitsNum < 1000) {
        return `${bitsNum} bps`;
    } else if (bitsNum < 1000000) {
        return `${(bitsNum / 1000).toFixed(2)} Kbps`;
    } else if (bitsNum < 1000000000) {
        return `${(bitsNum / 1000000).toFixed(2)} Mbps`;
    } else {
        return `${(bitsNum / 1000000000).toFixed(2)} Gbps`;
    }
};

const RouterDetailScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation<RouterDetailNavigationProp>();
    const route = useRoute<RouterDetailRouteProp>();
    const { routerId } = route.params;

    const {
        routers,
        loading,
        refreshDashboard
    } = useDashboardViewModel();

    const [selectedRouter, setSelectedRouter] = useState<Router | null>(null);

    // Find the router with the matching ID
    useEffect(() => {
        if (routers && routers.length > 0) {
            const router = routers.find(r => r.id === routerId);
            if (router) {
                setSelectedRouter(router);
            }
        }
    }, [routerId, routers]);

    // Render interface card
    const renderInterfaceCard = (interfaceItem: RouterInterface) => {
        const traffic = interfaceItem.traffic;

        return (
            <Card style={styles.interfaceCard} key={interfaceItem.id}>
                <Card.Content>
                    <View style={styles.interfaceHeader}>
                        <Text style={styles.interfaceName}>{interfaceItem.interface_name}</Text>
                        <Chip
                            mode="outlined"
                            style={[
                                styles.statusChip,
                                {
                                    backgroundColor: interfaceItem.link_status === 'UP'
                                        ? theme.colors.primary + '20'  // 20% opacity
                                        : theme.colors.error + '20'
                                }
                            ]}
                        >
                            {interfaceItem.link_status || 'UNKNOWN'}
                        </Chip>
                    </View>

                    <Text style={styles.providerText}>
                        Provedor: {interfaceItem.provider_info?.name || 'Desconhecido'}
                    </Text>

                    {traffic && (
                        <View style={styles.trafficContainer}>
                            <Text style={styles.trafficTitle}>Tráfego Atual:</Text>

                            <View style={styles.trafficItem}>
                                <Text style={styles.trafficLabel}>Download:</Text>
                                <Text style={styles.trafficValue}>
                                    {formatBitsToReadable(traffic.rx_bits_per_second)}
                                </Text>
                            </View>

                            <View style={styles.trafficItem}>
                                <Text style={styles.trafficLabel}>Upload:</Text>
                                <Text style={styles.trafficValue}>
                                    {formatBitsToReadable(traffic.tx_bits_per_second)}
                                </Text>
                            </View>

                            <View style={styles.trafficItem}>
                                <Text style={styles.trafficLabel}>Pacotes RX:</Text>
                                <Text style={styles.trafficValue}>
                                    {traffic.rx_packets_per_second}/s
                                </Text>
                            </View>

                            <View style={styles.trafficItem}>
                                <Text style={styles.trafficLabel}>Pacotes TX:</Text>
                                <Text style={styles.trafficValue}>
                                    {traffic.tx_packets_per_second}/s
                                </Text>
                            </View>

                            {(parseInt(traffic.rx_drops_per_second) > 0 || parseInt(traffic.tx_drops_per_second) > 0) && (
                                <View style={styles.dropsContainer}>
                                    <Text style={styles.dropsTitle}>Pacotes Perdidos:</Text>
                                    <Text style={styles.dropsText}>
                                        RX: {traffic.rx_drops_per_second}/s | TX: {traffic.tx_drops_per_second}/s
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </Card.Content>
            </Card>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar style="auto" />
                <Appbar.Header>
                    <Appbar.BackAction onPress={() => navigation.goBack()} />
                    <Appbar.Content title="Detalhes do Router" />
                </Appbar.Header>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Carregando detalhes...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!selectedRouter) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar style="auto" />
                <Appbar.Header>
                    <Appbar.BackAction onPress={() => navigation.goBack()} />
                    <Appbar.Content title="Detalhes do Router" />
                </Appbar.Header>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Router não encontrado.</Text>
                    <Button
                        mode="contained"
                        onPress={() => refreshDashboard()}
                        style={styles.refreshButton}
                    >
                        Atualizar Dados
                    </Button>
                    <Button
                        mode="outlined"
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        Voltar para o Dashboard
                    </Button>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="auto" />

            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title={`Router: ${selectedRouter.name}`} />
                <Appbar.Action icon="refresh" onPress={() => refreshDashboard()} />
            </Appbar.Header>

            <ScrollView style={styles.scrollView}>
                <View style={styles.container}>
                    {/* Status Card */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <View style={styles.headerRow}>
                                <Text style={styles.sectionTitle}>Status do Router</Text>
                                <Chip
                                    mode="flat"
                                    style={[
                                        styles.statusChip,
                                        { backgroundColor: selectedRouter.status === 'ACTIVE' || selectedRouter.status === 'active'
                                                ? theme.colors.primary + '20'  // 20% opacity
                                                : theme.colors.error + '20'
                                        }
                                    ]}
                                >
                                    {selectedRouter.status === 'ACTIVE' || selectedRouter.status === 'active' ? 'ATIVO' : 'INATIVO'}
                                </Chip>
                            </View>

                            <Divider style={styles.divider} />

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Uptime:</Text>
                                <Text style={styles.infoValue}>{selectedRouter.uptime || 'Não disponível'}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Último Contato:</Text>
                                <Text style={styles.infoValue}>
                                    {selectedRouter.last_seen_at
                                        ? new Date(selectedRouter.last_seen_at).toLocaleString('pt-BR')
                                        : 'Desconhecido'}
                                </Text>
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Network Info Card */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Informações de Rede</Text>
                            <Divider style={styles.divider} />

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>IP Público:</Text>
                                <Text style={styles.infoValue}>{selectedRouter.ip_address_public}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>IP Intranet:</Text>
                                <Text style={styles.infoValue}>{selectedRouter.ip_address_intranet}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Porta API:</Text>
                                <Text style={styles.infoValue}>{selectedRouter.api_port}</Text>
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Interfaces Section */}
                    <View style={styles.interfacesSection}>
                        <Text style={styles.sectionTitle}>Interfaces ({selectedRouter.interfaces?.length || 0})</Text>

                        {selectedRouter.interfaces && selectedRouter.interfaces.length > 0 ? (
                            selectedRouter.interfaces.map(interfaceItem =>
                                renderInterfaceCard(interfaceItem)
                            )
                        ) : (
                            <Text style={styles.noInterfacesText}>
                                Nenhuma interface disponível para este router.
                            </Text>
                        )}
                    </View>

                    <Button
                        mode="contained"
                        onPress={() => navigation.goBack()}
                        style={styles.button}
                    >
                        Voltar para o Dashboard
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        marginBottom: 24,
        textAlign: 'center',
        color: '#B00020',
    },
    card: {
        marginBottom: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    divider: {
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    infoLabel: {
        flex: 1,
        fontWeight: '500',
    },
    infoValue: {
        flex: 2,
    },
    interfacesSection: {
        marginBottom: 16,
    },
    interfaceCard: {
        marginVertical: 8,
    },
    interfaceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    interfaceName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    statusChip: {
        height: 28,
    },
    providerText: {
        fontSize: 14,
        marginBottom: 12,
    },
    trafficContainer: {
        marginTop: 8,
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 8,
    },
    trafficTitle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    trafficItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    trafficLabel: {
        color: '#555',
    },
    trafficValue: {
        fontWeight: '500',
    },
    dropsContainer: {
        marginTop: 8,
        padding: 8,
        backgroundColor: '#ffebee',
        borderRadius: 4,
    },
    dropsTitle: {
        color: '#B00020',
        fontWeight: '500',
        marginBottom: 4,
    },
    dropsText: {
        color: '#B00020',
    },
    button: {
        marginTop: 8,
        marginBottom: 24,
    },
    refreshButton: {
        marginBottom: 16,
    },
    backButton: {
        marginBottom: 16,
    },
    noInterfacesText: {
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: 16,
        color: '#666',
    },
});

export default RouterDetailScreen;