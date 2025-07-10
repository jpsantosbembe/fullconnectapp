import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Animated } from 'react-native';
import { Card, Text, useTheme, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Router, RouterInterface } from '../../../models/Router';
import { RootStackParamList } from '../../../navigation/AppNavigator';

type RouterDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RouterDetail'>;

interface RouterCardProps {
    router: Router;
}

const RouterCard: React.FC<RouterCardProps> = ({ router }) => {
    const theme = useTheme();
    const navigation = useNavigation<RouterDetailNavigationProp>();

    // Referência para a animação de pulso do halo
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0.6)).current;

    // Obter a primeira interface (se houver)
    const primaryInterface = router.interfaces && router.interfaces.length > 0
        ? router.interfaces[0]
        : null;

    // Status geral (ativo se o router estiver ativo)
    const isActive = router.status === 'ACTIVE' || router.status === 'active';

    // Criar animação de pulso para o halo
    useEffect(() => {
        // Criar animação pulsante para o halo ao redor do indicador
        Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.8,
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

    const handlePress = () => {
        navigation.navigate('RouterDetail', { routerId: router.id });
    };

    // Obter o uptime do router da nova API ou mostrar valor padrão se não disponível
    const getUptime = () => {
        return router.uptime || 'Não disponível';
    };

    // Formatar tráfego em bits/segundo para uma leitura mais amigável
    const formatTraffic = (bits: string | undefined): string => {
        if (!bits) return 'N/A';

        const bitsNum = parseInt(bits, 10);
        if (bitsNum < 1000) {
            return `${bitsNum} bps`;
        } else if (bitsNum < 1000000) {
            return `${(bitsNum / 1000).toFixed(1)} Kbps`;
        } else {
            return `${(bitsNum / 1000000).toFixed(1)} Mbps`;
        }
    };

    // Obter logo do provedor se disponível
    const getProviderLogo = () => {
        if (primaryInterface && primaryInterface.provider_info) {
            return primaryInterface.provider_info.logo_url_light_theme;
        }
        return null;
    };

    // Obter nome do provedor se disponível
    const getProviderName = () => {
        if (primaryInterface && primaryInterface.provider_info) {
            return primaryInterface.provider_info.name;
        }
        return "Link";
    };

    // Verificar se temos informações de tráfego
    const hasTrafficInfo = () => {
        return primaryInterface && primaryInterface.traffic;
    };

    return (
        <Card
            style={styles.card}
            mode="elevated"
            onPress={handlePress}
        >
            <Card.Content style={styles.cardContent}>
                {/* Primeira linha: Link, imagem e status */}
                <View style={styles.firstRow}>
                    {/* Lado esquerdo: Nome do router e provedor */}
                    <View style={styles.linkContainer}>
                        <Text variant="titleMedium" style={styles.linkText}>{router.name}</Text>
                        {getProviderLogo() ? (
                            <Image
                                source={{ uri: getProviderLogo() }}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        ) : (
                            <Avatar.Icon
                                size={24}
                                icon="link-variant"
                                style={{ backgroundColor: theme.colors.primary }}
                            />
                        )}
                    </View>

                    {/* Indicador de Status - com animação de halo */}
                    <View style={styles.statusContainer}>
                        <Animated.View
                            style={[
                                styles.halo,
                                {
                                    backgroundColor: isActive ? '#4CAF50' : '#F44336',
                                    transform: [{ scale: pulseAnim }],
                                    opacity: opacityAnim
                                }
                            ]}
                        />
                        <View
                            style={[
                                styles.statusIndicator,
                                { backgroundColor: isActive ? '#4CAF50' : '#F44336' }
                            ]}
                        />
                    </View>
                </View>

                {/* Segunda linha: Endereço IP e tempo */}
                <View style={styles.timeContainer}>
                    <Text variant="bodyMedium" style={styles.ipText}>
                        {router.ip_address_public || 'IP não disponível'}
                    </Text>

                    <Text variant="bodyMedium" style={styles.timeText}>
                        Uptime: {getUptime()}
                    </Text>

                    {hasTrafficInfo() && (
                        <View style={styles.trafficInfo}>
                            <View style={styles.trafficRow}>
                                <Text style={styles.trafficLabel}>↓</Text>
                                <Text style={styles.trafficValue}>
                                    {formatTraffic(primaryInterface?.traffic?.rx_bits_per_second)}
                                </Text>
                            </View>
                            <View style={styles.trafficRow}>
                                <Text style={styles.trafficLabel}>↑</Text>
                                <Text style={styles.trafficValue}>
                                    {formatTraffic(primaryInterface?.traffic?.tx_bits_per_second)}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Terceira linha: Seta */}
                <View style={styles.arrowContainer}>
                    <Text style={[styles.arrow, { color: theme.colors.primary }]}>→</Text>
                </View>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        margin: 8,
        flex: 1,
        maxWidth: '47%',
        height: 160, // Aumentado para acomodar informações de tráfego
    },
    cardContent: {
        height: '100%',
        padding: 10,
    },
    firstRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    linkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    linkText: {
        fontWeight: 'bold',
        marginRight: 8,
    },
    logo: {
        width: 24,
        height: 24,
        borderRadius: 4,
    },
    statusContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
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
    halo: {
        width: 10,
        height: 10,
        borderRadius: 5,
        position: 'absolute',
        zIndex: 1,
    },
    timeContainer: {
        marginVertical: 5,
    },
    ipText: {
        color: '#555',
        fontSize: 12,
        marginBottom: 2,
    },
    timeText: {
        color: '#555',
        fontSize: 12,
        marginBottom: 4,
    },
    trafficInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
        backgroundColor: '#f0f0f0',
        padding: 4,
        borderRadius: 4,
    },
    trafficRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    trafficLabel: {
        color: '#555',
        fontWeight: 'bold',
        marginRight: 4,
    },
    trafficValue: {
        fontSize: 11,
        color: '#333',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 6,
    },
    arrowContainer: {
        position: 'absolute',
        bottom: 10,
        right: 10,
    },
    arrow: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default RouterCard;